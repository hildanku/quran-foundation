#!/bin/bash

docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.jaeger.yml down