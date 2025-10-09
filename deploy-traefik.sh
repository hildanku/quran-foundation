#!/bin/bash

# Deploy script with Traefik reverse proxy
echo "🚀 Deploying fullstack application with Traefik..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required variables."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$TRAEFIK_EMAIL" ] || [ -z "$DOMAIN_FRONTEND" ] || [ -z "$DOMAIN_BACKEND" ]; then
    echo " Error: Missing required environment variables!"
    echo "Please ensure these variables are set in .env:"
    echo "- TRAEFIK_EMAIL"
    echo "- DOMAIN_FRONTEND"
    echo "- DOMAIN_BACKEND"
    exit 1
fi

echo " Email for Let's Encrypt: $TRAEFIK_EMAIL"
echo " Frontend domain: $DOMAIN_FRONTEND"
echo " Backend domain: $DOMAIN_BACKEND"

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove unused Docker resources
echo "Cleaning up Docker resources..."
docker system prune -f

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check service status
echo " Service status:"
docker-compose -f docker-compose.prod.yml ps

# Check Traefik dashboard access
echo ""
echo " Deployment completed!"
echo ""
echo " Your application should be available at:"
echo "   Frontend: https://$DOMAIN_FRONTEND"
echo "   Backend:  https://$DOMAIN_BACKEND"
echo ""
echo " Traefik dashboard (optional): https://traefik.$DOMAIN_FRONTEND"
echo ""
echo "To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To check SSL certificate status:"
echo "   docker-compose -f docker-compose.prod.yml exec traefik cat /letsencrypt/acme.json"