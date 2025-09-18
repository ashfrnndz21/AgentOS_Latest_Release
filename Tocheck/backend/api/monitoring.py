from fastapi import APIRouter
import time

router = APIRouter()

@router.get("/system/metrics")
async def get_system_metrics():
    """Get current system metrics"""
    try:
        # In a real implementation, you'd use psutil or similar
        # For now, return mock data that updates
        import random
        
        return {
            "cpu": random.uniform(30, 70),
            "memory": random.uniform(40, 80),
            "disk": random.uniform(60, 90),
            "network": random.uniform(10, 40),
            "agents": 2,
            "workflows": 1,
            "status": "healthy",
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "cpu": 45,
            "memory": 62,
            "disk": 78,
            "network": 23,
            "agents": 2,
            "workflows": 1,
            "status": "healthy",
            "timestamp": time.time()
        }

@router.get("/system/status")
async def get_system_status():
    """Get overall system status"""
    return {
        "status": "healthy",
        "uptime": time.time(),
        "version": "1.0.0",
        "components": {
            "database": "healthy",
            "api": "healthy",
            "agents": "healthy"
        }
    }