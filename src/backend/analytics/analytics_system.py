import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from pathlib import Path
import asyncio
from dataclasses import dataclass
import logging

@dataclass
class AnalyticsConfig:
    storage_path: Path = Path("analytics_data")
    update_interval: int = 300  # 5 minutes
    retention_days: int = 30
    batch_size: int = 1000

class AnalyticsEngine:
    def __init__(self, config: AnalyticsConfig = AnalyticsConfig()):
        self.config = config
        self.config.storage_path.mkdir(parents=True, exist_ok=True)
        self._setup_logging()
        self.metrics: Dict[str, List] = {}
        self.last_update = datetime.now()

    def _setup_logging(self) -> None:
        logging.basicConfig(
            filename=str(self.config.storage_path / "analytics.log"),
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger("Analytics")

    async def record_event(self, event_type: str, data: Dict) -> None:
        timestamp = datetime.now()
        event = {
            "timestamp": timestamp,
            "type": event_type,
            **data
        }
        
        if event_type not in self.metrics:
            self.metrics[event_type] = []
        
        self.metrics[event_type].append(event)
        
        # Process batch if needed
        if len(self.metrics[event_type]) >= self.config.batch_size:
            await self._process_metrics(event_type)

    async def _process_metrics(self, event_type: str) -> None:
        events = self.metrics[event_type]
        if not events:
            return

        df = pd.DataFrame(events)
        
        # Save raw data
        file_path = self.config.storage_path / f"{event_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
        df.to_parquet(file_path)
        
        # Clear processed events
        self.metrics[event_type] = []
        
        self.logger.info(f"Processed {len(events)} events of type {event_type}")

    async def track_workflow_metric(self, workflow_id: str, metric_name: str, value: float) -> None:
        """Track a workflow-specific metric."""
        await self.record_event("workflow_metric", {
            "workflow_id": workflow_id,
            "metric_name": metric_name,
            "value": value
        })

    async def generate_report(self, start_date: datetime, end_date: datetime) -> Dict:
        """Generate analytics report for the specified time period."""
        report = {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "metrics": {},
            "generated_at": datetime.now().isoformat()
        }
        
        # Process any pending metrics
        for event_type in list(self.metrics.keys()):
            await self._process_metrics(event_type)
        
        # Load and analyze data
        for file in self.config.storage_path.glob("*.parquet"):
            df = pd.read_parquet(file)
            
            # Filter by date range
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            mask = (df['timestamp'] >= start_date) & (df['timestamp'] <= end_date)
            period_data = df.loc[mask]
            
            if len(period_data) > 0:
                metrics = self._calculate_metrics(period_data)
                report["metrics"][file.stem.split('_')[0]] = metrics
        
        return report

    def _calculate_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate standard metrics for a DataFrame."""
        metrics = {
            "count": len(df),
            "by_hour": df.groupby(df['timestamp'].dt.hour).size().to_dict(),
        }
        
        # Add metric-specific calculations if present
        if 'value' in df.columns:
            metrics.update({
                "mean": df['value'].mean(),
                "median": df['value'].median(),
                "min": df['value'].min(),
                "max": df['value'].max()
            })
            
        return metrics
