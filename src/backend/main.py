from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
import psutil
import json
import uuid
from pathlib import Path
import asyncio

# Initialize FastAPI app
app = FastAPI(title="Office System API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data stores
documents = []
uploads_dir = Path("../../uploads")
uploads_dir.mkdir(exist_ok=True)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections = {"documents": [], "analytics": [], "workflows": []}
    
    async def connect(self, websocket: WebSocket, connection_type: str):
        await websocket.accept()
        self.active_connections[connection_type].append(websocket)
        
    def disconnect(self, websocket: WebSocket, connection_type: str):
        if websocket in self.active_connections[connection_type]:
            self.active_connections[connection_type].remove(websocket)
            
    async def send_message(self, message: dict, connection_type: str):
        for connection in self.active_connections[connection_type]:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Basic API route
@app.get("/")
async def root():
    return {"message": "Office System API", "version": "1.0.0"}

# WebSocket endpoints
@app.websocket("/ws/documents")
async def websocket_documents(websocket: WebSocket):
    await manager.connect(websocket, "documents")
    try:
        # Send initial data
        if documents:
            await websocket.send_json({
                "type": "document",
                "payload": documents[-1]
            })
        
        while True:
            data = await websocket.receive_text()
            # Just echo back for now
            try:
                received = json.loads(data)
                await websocket.send_json({
                    "type": "document",
                    "payload": received
                })
            except:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, "documents")

@app.websocket("/ws/analytics")
async def websocket_analytics(websocket: WebSocket):
    await manager.connect(websocket, "analytics")
    try:
        # Send initial analytics data
        await websocket.send_json({
            "type": "analytics",
            "payload": {
                "document_count": len(documents),
                "upload_count": 0,
                "user_actions": 0,
                "timestamp": datetime.now().isoformat()
            }
        })
        
        while True:
            await websocket.receive_text()
            # Keep connection alive with periodic updates
            await asyncio.sleep(5)
            await websocket.send_json({
                "type": "analytics",
                "payload": {
                    "document_count": len(documents),
                    "upload_count": 0,
                    "user_actions": len(documents),
                    "timestamp": datetime.now().isoformat()
                }
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, "analytics")

@app.websocket("/ws/workflows")
async def websocket_workflows(websocket: WebSocket):
    await manager.connect(websocket, "workflows")
    try:
        # Send sample workflow data
        await websocket.send_json({
            "type": "workflow",
            "payload": {
                "workflow_id": str(uuid.uuid4()),
                "document_id": "sample-doc",
                "status": "completed",
                "started_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "steps": [
                    {"name": "Initialization", "status": "completed"},
                    {"name": "Processing", "status": "completed"},
                    {"name": "Finalization", "status": "completed"}
                ]
            }
        })
        
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "workflows")

# API endpoints
@app.post("/api/documents")
async def create_document(document: dict):
    doc_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    new_doc = {
        "id": doc_id,
        "title": document.get("title", "Untitled"),
        "content": document.get("content", ""),
        "status": "new",
        "created_at": now,
        "updated_at": now
    }
    
    documents.append(new_doc)
    
    # Notify WebSocket clients
    await manager.send_message({"type": "document", "payload": new_doc}, "documents")
    await manager.send_message({
        "type": "analytics",
        "payload": {
            "document_count": len(documents),
            "upload_count": 0,
            "user_actions": len(documents),
            "timestamp": now
        }
    }, "analytics")
    
    return new_doc

@app.get("/api/system-status")
async def get_system_status():
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"doc_{timestamp}_{file.filename}"
    filepath = uploads_dir / filename
    
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create a document for the upload
    doc_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    new_doc = {
        "id": doc_id,
        "title": file.filename,
        "status": "uploaded",
        "created_at": now,
        "updated_at": now
    }
    
    documents.append(new_doc)
    
    # Notify WebSocket clients
    await manager.send_message({"type": "document", "payload": new_doc}, "documents")
    
    return {
        "success": True,
        "filename": filename,
        "document_id": doc_id
    }

if __name__ == "__main__":
    import uvicorn
    
    # Write PID file
    with open("../system.pid", "w") as f:
        f.write(str(os.getpid()))
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
