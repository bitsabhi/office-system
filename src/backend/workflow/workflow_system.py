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
