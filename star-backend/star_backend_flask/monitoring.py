"""
Azure Application Insights integration for STAR backend
This module provides monitoring capabilities for the Flask application
"""

import os
import logging
import time
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.stats import stats as stats_module
from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import view as view_module
from opencensus.tags import tag_map as tag_map_module
from opencensus.ext.azure import metrics_exporter

# Configure logging
logger = logging.getLogger(__name__)

# Define measures
HTTP_LATENCY_MEASURE = measure_module.MeasureFloat(
    "http_latency", 
    "HTTP request latency in milliseconds",
    "ms"
)

FEED_REQUEST_MEASURE = measure_module.MeasureInt(
    "feed_requests",
    "Number of feed requests",
    "1"
)

RECOMMENDATION_REQUEST_MEASURE = measure_module.MeasureInt(
    "recommendation_requests",
    "Number of recommendation requests",
    "1"
)

REDIS_LATENCY_MEASURE = measure_module.MeasureFloat(
    "redis_latency",
    "Redis operation latency in milliseconds",
    "ms"
)

def setup_metrics():
    """Set up OpenCensus metrics with Azure exporter"""
    # Create views for the measures
    latency_view = view_module.View(
        "http_latency",
        "Distribution of HTTP latencies",
        [],
        HTTP_LATENCY_MEASURE,
        aggregation_module.DistributionAggregation(
            [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 10000]
        )
    )
    
    feed_view = view_module.View(
        "feed_requests",
        "Number of feed requests",
        [],
        FEED_REQUEST_MEASURE,
        aggregation_module.CountAggregation()
    )
    
    recommendation_view = view_module.View(
        "recommendation_requests",
        "Number of recommendation requests",
        [],
        RECOMMENDATION_REQUEST_MEASURE,
        aggregation_module.CountAggregation()
    )
    
    redis_latency_view = view_module.View(
        "redis_latency",
        "Distribution of Redis latencies",
        [],
        REDIS_LATENCY_MEASURE,
        aggregation_module.DistributionAggregation(
            [0, 1, 2, 3, 4, 5, 10, 25, 50, 75, 100, 250, 500, 1000]
        )
    )
    
    # Register views
    stats = stats_module.stats
    view_manager = stats.view_manager
    view_manager.register_view(latency_view)
    view_manager.register_view(feed_view)
    view_manager.register_view(recommendation_view)
    view_manager.register_view(redis_latency_view)
    
    # Set up metrics exporter
    connection_string = get_connection_string()
    if connection_string:
        exporter = metrics_exporter.new_metrics_exporter(
            connection_string=connection_string,
            export_interval=15.0
        )
        logger.info("Azure Metrics Exporter configured")

def get_connection_string():
    """Get Application Insights connection string from environment variables"""
    instrumentation_key = os.environ.get('APPINSIGHTS_INSTRUMENTATIONKEY')
    
    if not instrumentation_key:
        logger.warning("APPINSIGHTS_INSTRUMENTATIONKEY not set, Application Insights disabled")
        return None
        
    return f"InstrumentationKey={instrumentation_key}"

def setup_monitoring(app):
    """Configure Azure Application Insights monitoring for the Flask app"""
    connection_string = get_connection_string()
    if not connection_string:
        return None
    
    # Add Azure Log handler
    logger.addHandler(AzureLogHandler(
        connection_string=connection_string
    ))
    
    # Initialize Flask middleware
    middleware = FlaskMiddleware(
        app,
        exporter=AzureExporter(connection_string=connection_string),
        sampler=ProbabilitySampler(rate=1.0)
    )
    
    # Set up metrics
    setup_metrics()
    
    logger.info("Azure Application Insights monitoring enabled")
    return middleware

class Metrics:
    """Helper class for recording metrics"""
    
    @staticmethod
    def record_request_latency(latency_ms):
        """Record HTTP request latency in milliseconds"""
        stats = stats_module.stats
        mmap = stats.stats_recorder.new_measurement_map()
        tmap = tag_map_module.TagMap()
        
        mmap.measure_float_put(HTTP_LATENCY_MEASURE, latency_ms)
        mmap.record(tmap)
    
    @staticmethod
    def record_feed_request():
        """Record a feed request"""
        stats = stats_module.stats
        mmap = stats.stats_recorder.new_measurement_map()
        tmap = tag_map_module.TagMap()
        
        mmap.measure_int_put(FEED_REQUEST_MEASURE, 1)
        mmap.record(tmap)
    
    @staticmethod
    def record_recommendation_request():
        """Record a recommendation request"""
        stats = stats_module.stats
        mmap = stats.stats_recorder.new_measurement_map()
        tmap = tag_map_module.TagMap()
        
        mmap.measure_int_put(RECOMMENDATION_REQUEST_MEASURE, 1)
        mmap.record(tmap)
    
    @staticmethod
    def record_redis_latency(latency_ms):
        """Record Redis operation latency in milliseconds"""
        stats = stats_module.stats
        mmap = stats.stats_recorder.new_measurement_map()
        tmap = tag_map_module.TagMap()
        
        mmap.measure_float_put(REDIS_LATENCY_MEASURE, latency_ms)
        mmap.record(tmap)
    
    @staticmethod
    def timed_operation(metric_type='http'):
        """
        Decorator to measure operation time and record the appropriate metric
        
        Usage:
            @Metrics.timed_operation(metric_type='http')
            def my_function():
                pass
        """
        def decorator(func):
            def wrapper(*args, **kwargs):
                start_time = time.time()
                result = func(*args, **kwargs)
                latency_ms = (time.time() - start_time) * 1000
                
                if metric_type == 'http':
                    Metrics.record_request_latency(latency_ms)
                elif metric_type == 'redis':
                    Metrics.record_redis_latency(latency_ms)
                
                return result
            return wrapper
        return decorator