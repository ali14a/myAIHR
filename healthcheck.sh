#!/bin/sh

# Health check script for Docker containers
# This script checks if the frontend application is responding

# Set timeout
TIMEOUT=10

# Check if the application is responding
if curl -f -s --max-time $TIMEOUT http://localhost:3000/ > /dev/null 2>&1; then
    echo "Frontend is healthy"
    exit 0
else
    echo "Frontend is not responding"
    exit 1
fi


