from enum import Enum
from typing import BinaryIO, Dict, List, Optional
import aiofiles
import os
from datetime import datetime
import magic  # for file type detection
import asyncio
from pathlib import Path

class DocumentType(Enum):
    PDF = "application/pdf"
    EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    WORD = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    CSV = "text/csv"
    UNKNOWN = "application/octet-stream"

class ProcessingStage(Enum):
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    PROCESSING = "processing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentProcessor:
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
        
    async def process_document(self, file: BinaryIO, filename: str) -> Dict:
        """Process an uploaded document through all stages."""
        doc_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(self.upload_dir, doc_id)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        doc_type = self._detect_document_type(file_path)
        return {
            'doc_id': doc_id,
            'filename': filename,
            'file_path': file_path,
            'doc_type': doc_type,
            'size': len(content)
        }
        
    def _detect_document_type(self, file_path: str) -> DocumentType:
        """Detect document type using magic numbers."""
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        return DocumentType(file_type) if file_type in [t.value for t in DocumentType] else DocumentType.UNKNOWN
