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
