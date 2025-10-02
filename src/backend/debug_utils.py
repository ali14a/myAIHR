"""
Debug utilities for development
These functions are only available in development mode
"""

import os
import logging
import time
import functools
from typing import Any, Callable, Optional
from datetime import datetime

# Check if we're in development mode
IS_DEV = os.getenv("ENVIRONMENT", "development").lower() == "development"

# Configure debug logger
debug_logger = logging.getLogger("debug")
debug_logger.setLevel(logging.DEBUG if IS_DEV else logging.INFO)

def debug_log(message: str, *args, **kwargs) -> None:
    """Debug logger that only works in development"""
    if IS_DEV:
        debug_logger.debug(f"[DEBUG] {message}", *args, **kwargs)

def debug_error(message: str, error: Exception) -> None:
    """Debug error logger"""
    if IS_DEV:
        debug_logger.error(f"[DEBUG ERROR] {message}: {error}", exc_info=True)

def debug_warn(message: str, *args, **kwargs) -> None:
    """Debug warning logger"""
    if IS_DEV:
        debug_logger.warning(f"[DEBUG WARN] {message}", *args, **kwargs)

def debug_info(message: str, *args, **kwargs) -> None:
    """Debug info logger"""
    if IS_DEV:
        debug_logger.info(f"[DEBUG INFO] {message}", *args, **kwargs)

def debug_api_call(method: str, endpoint: str, data: Any = None) -> None:
    """Debug API call logger"""
    if IS_DEV:
        debug_log(f"API Call: {method} {endpoint}", data)

def debug_api_response(endpoint: str, response: Any, status_code: int) -> None:
    """Debug API response logger"""
    if IS_DEV:
        debug_log(f"API Response: {endpoint} - {status_code}", response)

def debug_database_query(query: str, params: Any = None) -> None:
    """Debug database query logger"""
    if IS_DEV:
        debug_log(f"Database Query: {query}", params)

def debug_file_operation(operation: str, file_path: str, file_size: int = None) -> None:
    """Debug file operation logger"""
    if IS_DEV:
        size_info = f" ({file_size} bytes)" if file_size else ""
        debug_log(f"File Operation: {operation} {file_path}{size_info}")

def debug_authentication(action: str, user_id: int = None) -> None:
    """Debug authentication logger"""
    if IS_DEV:
        user_info = f" (User: {user_id})" if user_id else ""
        debug_log(f"Authentication: {action}{user_info}")

def debug_resume_processing(resume_id: int, operation: str, details: Any = None) -> None:
    """Debug resume processing logger"""
    if IS_DEV:
        debug_log(f"Resume Processing: {operation} (ID: {resume_id})", details)

def debug_job_matching(resume_id: int, job_id: int, match_score: float) -> None:
    """Debug job matching logger"""
    if IS_DEV:
        debug_log(f"Job Matching: Resume {resume_id} vs Job {job_id} - Score: {match_score}")

def debug_cover_letter_generation(resume_id: int, job_id: int, letter_length: int) -> None:
    """Debug cover letter generation logger"""
    if IS_DEV:
        debug_log(f"Cover Letter: Resume {resume_id} + Job {job_id} - Length: {letter_length}")

def debug_performance(operation: str, duration: float) -> None:
    """Debug performance logger"""
    if IS_DEV:
        debug_log(f"Performance: {operation} took {duration:.2f}s")

def debug_llm_call(prompt: str, response: str, model: str = "default") -> None:
    """Debug LLM call logger"""
    if IS_DEV:
        debug_log(f"LLM Call: {model}", {
            "prompt_length": len(prompt),
            "response_length": len(response),
            "prompt_preview": prompt[:100] + "..." if len(prompt) > 100 else prompt
        })

def debug_email_sending(to: str, subject: str, success: bool) -> None:
    """Debug email sending logger"""
    if IS_DEV:
        status = "Success" if success else "Failed"
        debug_log(f"Email: {status} - {to} - {subject}")

def debug_notification(type: str, message: str, user_id: int = None) -> None:
    """Debug notification logger"""
    if IS_DEV:
        user_info = f" (User: {user_id})" if user_id else ""
        debug_log(f"Notification: {type} - {message}{user_info}")

def debug_validation(field: str, value: Any, is_valid: bool, error: str = None) -> None:
    """Debug validation logger"""
    if IS_DEV:
        status = "Valid" if is_valid else "Invalid"
        error_info = f" - Error: {error}" if error else ""
        debug_log(f"Validation: {field} - {status}{error_info}", value)

def debug_cache_operation(operation: str, key: str, hit: bool = None) -> None:
    """Debug cache operation logger"""
    if IS_DEV:
        hit_info = f" - {'Hit' if hit else 'Miss'}" if hit is not None else ""
        debug_log(f"Cache: {operation} {key}{hit_info}")

def debug_websocket(event: str, user_id: int = None, data: Any = None) -> None:
    """Debug websocket logger"""
    if IS_DEV:
        user_info = f" (User: {user_id})" if user_id else ""
        debug_log(f"WebSocket: {event}{user_info}", data)

def debug_timer(label: str) -> Callable:
    """Debug timer decorator"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if IS_DEV:
                start_time = time.time()
                debug_log(f"Timer Start: {label}")
                result = func(*args, **kwargs)
                end_time = time.time()
                duration = end_time - start_time
                debug_performance(label, duration)
                return result
            else:
                return func(*args, **kwargs)
        return wrapper
    return decorator

def debug_group(group_name: str) -> Callable:
    """Debug group decorator"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if IS_DEV:
                debug_log(f"Group Start: {group_name}")
                result = func(*args, **kwargs)
                debug_log(f"Group End: {group_name}")
                return result
            else:
                return func(*args, **kwargs)
        return wrapper
    return decorator

def debug_exception_handler(func: Callable) -> Callable:
    """Debug exception handler decorator"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if IS_DEV:
                debug_error(f"Exception in {func.__name__}", e)
            raise
    return wrapper

def debug_async_timer(label: str) -> Callable:
    """Debug async timer decorator"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            if IS_DEV:
                start_time = time.time()
                debug_log(f"Async Timer Start: {label}")
                result = await func(*args, **kwargs)
                end_time = time.time()
                duration = end_time - start_time
                debug_performance(f"Async {label}", duration)
                return result
            else:
                return await func(*args, **kwargs)
        return wrapper
    return decorator

def debug_environment() -> dict:
    """Get debug environment information"""
    if IS_DEV:
        return {
            "environment": os.getenv("ENVIRONMENT", "development"),
            "python_version": os.sys.version,
            "working_directory": os.getcwd(),
            "timestamp": datetime.now().isoformat(),
            "debug_enabled": True
        }
    return {"debug_enabled": False}

def debug_memory_usage() -> dict:
    """Get debug memory usage information"""
    if IS_DEV:
        try:
            import psutil
            process = psutil.Process()
            return {
                "memory_percent": process.memory_percent(),
                "memory_rss": process.memory_info().rss,
                "memory_vms": process.memory_info().vms,
                "cpu_percent": process.cpu_percent()
            }
        except ImportError:
            return {"error": "psutil not available"}
    return {"debug_enabled": False}

def debug_database_connection() -> dict:
    """Get debug database connection information"""
    if IS_DEV:
        try:
            from .database import engine
            return {
                "database_url": str(engine.url).replace(engine.url.password, "***") if engine.url.password else str(engine.url),
                "pool_size": engine.pool.size(),
                "checked_in": engine.pool.checkedin(),
                "checked_out": engine.pool.checkedout(),
                "overflow": engine.pool.overflow()
            }
        except Exception as e:
            return {"error": str(e)}
    return {"debug_enabled": False}

def debug_api_endpoints() -> list:
    """Get debug API endpoints information"""
    if IS_DEV:
        try:
            from ..app import app
            routes = []
            for route in app.routes:
                if hasattr(route, 'methods') and hasattr(route, 'path'):
                    routes.append({
                        "path": route.path,
                        "methods": list(route.methods),
                        "name": getattr(route, 'name', 'Unknown')
                    })
            return routes
        except Exception as e:
            return [{"error": str(e)}]
    return []

def is_debug_enabled() -> bool:
    """Check if debugging is enabled"""
    return IS_DEV

def get_debug_environment() -> str:
    """Get current environment"""
    return os.getenv("ENVIRONMENT", "development")

def get_debug_env_vars() -> dict:
    """Get all environment variables (for debugging)"""
    if IS_DEV:
        return dict(os.environ)
    return {}
