"""
Health monitoring script for STAR backend on Azure App Service
Provides regular health checks and logs the results
"""

import requests
import time
import logging
import argparse
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("health_monitor.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def check_health(endpoint, timeout=10):
    """
    Check the health of the backend API endpoint
    
    Args:
        endpoint: The health endpoint URL to check
        timeout: Request timeout in seconds
    
    Returns:
        bool: True if health check passed, False otherwise
    """
    start_time = time.time()
    try:
        response = requests.get(endpoint, timeout=timeout)
        latency = (time.time() - start_time) * 1000
        
        if response.status_code == 200 and response.json().get('status') == 'ok':
            logger.info(f"Health check passed - Latency: {latency:.2f}ms")
            return True
        else:
            logger.error(f"Health check failed - Status: {response.status_code}, Response: {response.text}, Latency: {latency:.2f}ms")
            return False
    except requests.exceptions.Timeout:
        logger.error(f"Health check timed out after {timeout} seconds")
        return False
    except requests.exceptions.ConnectionError:
        logger.error("Health check connection failed - Service may be down or unreachable")
        return False
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return False

def run_continuous_monitoring(endpoint, interval=3600, exit_on_failure=False):
    """
    Run continuous health monitoring at specified interval
    
    Args:
        endpoint: The health endpoint URL to check
        interval: Time between checks in seconds (default: 1 hour)
        exit_on_failure: Whether to exit if health check fails
    """
    logger.info(f"Starting continuous health monitoring of {endpoint} at {interval}s intervals")
    
    while True:
        logger.info(f"Running health check at {datetime.now().isoformat()}")
        check_result = check_health(endpoint)
        
        if not check_result and exit_on_failure:
            logger.critical("Health check failed and exit_on_failure is set. Exiting.")
            sys.exit(1)
            
        time.sleep(interval)

def run_single_check(endpoint):
    """
    Run a single health check and exit
    
    Args:
        endpoint: The health endpoint URL to check
    
    Returns:
        int: Exit code (0 for success, 1 for failure)
    """
    logger.info(f"Running single health check for {endpoint}")
    result = check_health(endpoint)
    return 0 if result else 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Health monitoring for STAR backend')
    parser.add_argument('--endpoint', default="https://star-app-backend.azurewebsites.net/api/health", 
                        help='Health endpoint URL to monitor')
    parser.add_argument('--interval', type=int, default=3600,
                        help='Interval between checks in seconds (default: 3600)')
    parser.add_argument('--continuous', action='store_true', 
                        help='Run in continuous monitoring mode')
    parser.add_argument('--exit-on-failure', action='store_true',
                        help='Exit if health check fails (when in continuous mode)')
    
    args = parser.parse_args()
    
    if args.continuous:
        run_continuous_monitoring(args.endpoint, args.interval, args.exit_on_failure)
    else:
        sys.exit(run_single_check(args.endpoint))