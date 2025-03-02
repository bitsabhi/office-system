import pytest
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from analytics.analytics_system import AnalyticsEngine
from workflow.workflow_system import WorkflowEngine

@pytest.mark.asyncio
async def test_system_integration():
    analytics = AnalyticsEngine()
    workflow = WorkflowEngine()
    
    # Test workflow creation
    workflow_id = await workflow.create_workflow({
        "name": "Test Workflow",
        "tasks": [
            {
                "name": "Test Task",
                "type": "document_processing",
                "parameters": {"document_id": "test123"}
            }
        ]
    })
    
    assert workflow_id is not None

    # Test analytics recording
    await analytics.record_event("test_event", {"status": "success"})
    report = await analytics.generate_report(
        start_date=datetime.now() - timedelta(days=1),
        end_date=datetime.now()
    )
    assert report is not None
