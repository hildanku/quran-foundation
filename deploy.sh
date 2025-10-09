#!/bin/bash

# Deployment script for Quran Foundation App
set -e

echo "Starting deployment process..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads
mkdir -p logs

# Set environment variables
if [ ! -f .env ]; then
    echo ".env file not found. Please create it with your production environment variables."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Remove old images (optional)
read -p "Do you want to remove old Docker images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing old Docker images..."
    docker system prune -f
fi

echo "Jaeger for tracing is enabled. Ensure you have the Jaeger agent running."
docker compose -f docker-compose.jaeger.yml up -d

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 30

# Check service health
echo "Checking service health..."
docker compose -f docker-compose.prod.yml ps

# Show logs
echo "Showing recent logs..."
docker compose -f docker-compose.prod.yml logs --tail=50

echo "Deployment completed!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:3000"
echo "Health check: http://localhost:3000/api/v1/healthcheck"