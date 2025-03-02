# Project Analysis Report
Generated on: Tue Feb 25 16:58:30 IST 2025

## 1. Project Structure
```
./analytics_data/analytics.log
./analyze_project.sh
./config/logging/logging_config.json
./config/system_config.json
./data/analytics/analytics.log
./logs/system.log
./monitoring/monitoring-setup.sh
./project-overview.md
./project-setup-2.sh
./project_analysis.md
./pyproject.toml
./requirements.txt
./server-implementation.py
./src/__init__.py
./src/backend/analytics/__init__.py
./src/backend/analytics/analytics_system.py
./src/backend/main.py
./src/backend/monitoring/__init__.py
./src/backend/monitoring/system_monitor.py
./src/backend/workflow/__init__.py
./src/backend/workflow/document_processor.py
./src/backend/workflow/workflow_system.py
./src/frontend/App.css
./src/frontend/App.tsx
./src/frontend/assets/react.svg
./src/frontend/components/Dashboard.tsx
./src/frontend/index.css
./src/frontend/main.tsx
./src/frontend/package-lock.json
./src/frontend/package.json
./src/frontend/public/vite.svg
./src/frontend/vite-env.d.ts
./src/frontend/vite.config.ts
./src/office_system.egg-info/PKG-INFO
./src/office_system.egg-info/SOURCES.txt
./src/office_system.egg-info/dependency_links.txt
./src/office_system.egg-info/top_level.txt
./src/setup-py.py
./system.pid
./test.pdf
./tests/test_integration.py
./uploads/doc_20250222_171808_test.pdf
./uploads/doc_20250222_171938_test.pdf
./work_sessions.log
```

## 2. Backend Overview
### Python Files:
```
src/backend/analytics/__init__.py
src/backend/analytics/analytics_system.py
src/backend/main.py
src/backend/monitoring/__init__.py
src/backend/monitoring/system_monitor.py
src/backend/node_modules/flatted/python/flatted.py
src/backend/workflow/__init__.py
src/backend/workflow/document_processor.py
src/backend/workflow/workflow_system.py
```

### Main Backend Components:
#### Analytics System:
```python
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
```

#### Workflow System:
```python
import asyncio
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import datetime
import json

class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class WorkflowTask:
    id: str
    name: str
    type: str
    parameters: Dict
    depends_on: List[str]
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Dict] = None

@dataclass
class Workflow:
    id: str
    name: str
    tasks: List[WorkflowTask]
    status: WorkflowStatus = WorkflowStatus.PENDING
    created_at: datetime.datetime = datetime.datetime.now()
    completed_at: Optional[datetime.datetime] = None

class WorkflowEngine:
    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.task_handlers: Dict[str, callable] = {}
        self._register_default_handlers()

    def _register_default_handlers(self):
        self.task_handlers.update({
            "document_processing": self._handle_document_processing,
            "data_extraction": self._handle_data_extraction,
            "notification": self._handle_notification,
            "approval": self._handle_approval,
            "archiving": self._handle_archiving
        })

    async def create_workflow(self, workflow_def: Dict) -> str:
        workflow = Workflow(
            id=f"wf_{len(self.workflows)}",
            name=workflow_def["name"],
            tasks=[
                WorkflowTask(
                    id=f"task_{i}",
                    name=task["name"],
                    type=task["type"],
                    parameters=task["parameters"],
                    depends_on=task.get("depends_on", [])
                )
                for i, task in enumerate(workflow_def["tasks"])
            ]
        )
        self.workflows[workflow.id] = workflow
        return workflow.id

    async def execute_workflow(self, workflow_id: str) -> Dict:
        workflow = self.workflows[workflow_id]
        workflow.status = WorkflowStatus.RUNNING

        try:
            completed_tasks = set()
            while len(completed_tasks) < len(workflow.tasks):
                runnable_tasks = self._get_runnable_tasks(workflow, completed_tasks)
                if not runnable_tasks:
                    break

                results = await asyncio.gather(
                    *[self._execute_task(task) for task in runnable_tasks],
                    return_exceptions=True
                )

                for task, result in zip(runnable_tasks, results):
                    if isinstance(result, Exception):
                        task.status = TaskStatus.FAILED
                        task.result = {"error": str(result)}
                    else:
                        task.status = TaskStatus.COMPLETED
                        task.result = result
                        completed_tasks.add(task.id)

            workflow.status = WorkflowStatus.COMPLETED
            workflow.completed_at = datetime.datetime.now()
            return self._get_workflow_result(workflow)

        except Exception as e:
            workflow.status = WorkflowStatus.FAILED
            return {"error": str(e)}

    def _get_runnable_tasks(self, workflow: Workflow, completed_tasks: set) -> List[WorkflowTask]:
        return [
            task for task in workflow.tasks
            if task.id not in completed_tasks
            and task.status != TaskStatus.FAILED
            and all(dep in completed_tasks for dep in task.depends_on)
        ]

    async def _execute_task(self, task: WorkflowTask) -> Dict:
        task.status = TaskStatus.PROCESSING
        handler = self.task_handlers.get(task.type)
        if not handler:
            raise ValueError(f"No handler for task type: {task.type}")
        return await handler(task.parameters)

    async def _handle_document_processing(self, parameters: Dict) -> Dict:
        # Document processing implementation
        return {"status": "processed", "document_id": parameters["document_id"]}

    async def _handle_data_extraction(self, parameters: Dict) -> Dict:
        # Data extraction implementation
        return {"extracted_data": {"key": "value"}}

    async def _handle_notification(self, parameters: Dict) -> Dict:
        # Notification implementation
        return {"notified": True, "recipient": parameters["recipient"]}

    async def _handle_approval(self, parameters: Dict) -> Dict:
        # Approval implementation
        return {"approved": True, "approver": parameters["approver"]}

    async def _handle_archiving(self, parameters: Dict) -> Dict:
        # Archiving implementation
        return {"archived": True, "location": "archive/2025/02"}

    def _get_workflow_result(self, workflow: Workflow) -> Dict:
        return {
            "workflow_id": workflow.id,
            "status": workflow.status.value,
            "tasks": [
                {
                    "id": task.id,
                    "name": task.name,
                    "status": task.status.value,
                    "result": task.result
                }
                for task in workflow.tasks
            ],
            "started_at": workflow.created_at.isoformat(),
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None
        }

    def get_workflow_status(self, workflow_id: str) -> Dict:
        workflow = self.workflows[workflow_id]
        return {
            "id": workflow.id,
            "name": workflow.name,
            "status": workflow.status.value,
            "tasks_total": len(workflow.tasks),
            "tasks_completed": len([t for t in workflow.tasks if t.status == TaskStatus.COMPLETED]),
            "created_at": workflow.created_at.isoformat(),
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None
        }
```

#### System Monitor:
```python
import psutil
from typing import Dict
from datetime import datetime

class SystemMonitor:
    def __init__(self):
        self.system_stats = {}
        
    async def get_system_stats(self) -> Dict:
        """Get current system statistics."""
        return {
            'timestamp': datetime.now(),
            'cpu_usage': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory()._asdict(),
            'disk_usage': psutil.disk_usage('/')._asdict()
        }

    async def get_resource_usage(self) -> Dict:
        """Get a summary of current resource usage."""
        stats = await self.get_system_stats()
        return {
            'cpu_percentage': stats['cpu_usage'],
            'memory_percentage': stats['memory_usage']['percent'],
            'disk_percentage': stats['disk_usage']['percent']
        }
```

## 3. Frontend Overview
### Frontend Files:
```
src/frontend/App.tsx
src/frontend/components/Dashboard.tsx
src/frontend/main.tsx
src/frontend/vite-env.d.ts
src/frontend/vite.config.ts
```

### Main Component:
```tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

[Rest of the Dashboard.tsx content]
```

## 4. Configuration
### Configuration Files:
```
config/logging/logging_config.json
config/system_config.json
```

## 5. Project Dependencies
### Python Dependencies:
```
annotated-types==0.7.0
anyio==4.8.0
blinker==1.9.0
click==8.1.8
fastapi==0.115.8
Flask==3.1.0
h11==0.14.0
idna==3.10
itsdangerous==2.2.0
Jinja2==3.1.5
MarkupSafe==3.0.2
pydantic==2.10.6
pydantic_core==2.27.2
sniffio==1.3.1
starlette==0.45.3
typing_extensions==4.12.2
uvicorn==0.34.0
Werkzeug==3.1.3
```

### Frontend Dependencies:
```json
{
  "name": "office-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "antd": "^5.24.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.19.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.19.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.22.0",
    "vite": "^6.1.0"
  }
}
```

## 6. Project Overview
# Office System Integration Project Overview

## Current Project Status
```bash
# Generate project overview
echo "Project Status Overview - $(date)" > overview.txt
echo -e "\nDirectory Structure:" >> overview.txt
tree -L 3 >> overview.txt
echo -e "\nPython Environment:" >> overview.txt
pip freeze >> overview.txt
echo -e "\nSystem Configuration:" >> overview.txt
cat config/system_config.json >> overview.txt
echo -e "\nSystem Log Status:" >> overview.txt
tail -n 20 logs/system.log >> overview.txt
```

## Component Status

### ✅ Completed Tasks
1. Project structure created
2. Virtual environment setup
3. Dependencies installed
4. Configuration files created
5. Source files organized:
   - Analytics System
   - Workflow System
   - Frontend Components
6. Basic integration tests created
7. Initial system deployment

### 🔄 Current Issues
1. Test framework needs pytest-asyncio for async tests
2. Main application needs proper async handling
3. Frontend integration pending
4. System monitoring not set up

## Next Steps

### 1. Install Additional Dependencies
```bash
pip install pytest-asyncio
```

### 2. Enhance System Monitoring
```bash
# Create monitoring directory
mkdir -p src/monitoring
touch src/monitoring/__init__.py

# Create monitor script
cat > src/monitoring/system_monitor.py << EOF
import psutil
import asyncio
import logging
from datetime import datetime

class SystemMonitor:
    def __init__(self):
        self.logger = logging.getLogger("SystemMonitor")
        
    async def monitor_resources(self):
        while True:
            cpu = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            
            self.logger.info(f"System Status - CPU: {cpu}%, Memory: {memory.percent}%")
            await asyncio.sleep(60)
            
    async def start(self):
        await self.monitor_resources()
EOF
```

### 3. Integrate Frontend
- Set up a basic web server for the frontend
- Connect the React components
- Implement API endpoints

### 4. Implement Logging Enhancements
```bash
# Create logging configuration
mkdir -p config/logging
cat > config/logging/logging_config.json << EOF
{
    "version": 1,
    "disable_existing_loggers": false,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        }
    },
    "handlers": {
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "standard",
            "filename": "logs/system.log",
            "maxBytes": 10485760,
            "backupCount": 5
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["file"]
    }
}
EOF
```

### 5. Deployment Considerations
- Set up environmental variables
- Create backup procedures
- Implement health checks
- Add system metrics collection

## Checking System Health
```bash
# Check system status
ps aux | grep main.py
cat logs/system.log
```

## Backup Current State
```bash
# Create backup of current state
tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" \
    --exclude="venv" \
    --exclude="__pycache__" \
    --exclude=".pytest_cache" \
    src config tests data logs
```
## 7. Data Directory Structure
```
data/analytics/analytics.log
```

## 8. Testing Structure
```
tests/__pycache__/test_integration.cpython-313-pytest-8.3.4.pyc
tests/test_integration.py
```


