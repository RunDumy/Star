# Docker Setup for STAR Platform

This directory contains Docker configurations for running the STAR platform locally using Docker Compose.

## Services

- **frontend**: Next.js application (Port 3000)
- **backend**: Flask API server (Port 5000)
- **supabase**: PostgreSQL database with Supabase (Port 5432)
- **supabase-studio**: Supabase web UI (Port 3001)
- **redis**: Redis cache server (Port 6379)

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM allocated to Docker

### Development Setup (with hot reload)

```bash
# From the project root
docker-compose -f config/docker/docker-compose.yml -f config/docker/docker-compose.override.yml up --build
```

### Production-like Setup

```bash
# From the project root
docker-compose -f config/docker/docker-compose.yml up --build
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Supabase Studio**: http://localhost:3001
- **PgAdmin**: http://localhost:5050 (dev only)
- **Database**: localhost:54322 (dev) / localhost:5432 (prod)

## Useful Commands

### Start services

```bash
docker-compose -f config/docker/docker-compose.yml up -d
```

### Stop services

```bash
docker-compose -f config/docker/docker-compose.yml down
```

### View logs

```bash
# All services
docker-compose -f config/docker/docker-compose.yml logs -f

# Specific service
docker-compose -f config/docker/docker-compose.yml logs -f backend
```

### Rebuild and restart

```bash
docker-compose -f config/docker/docker-compose.yml up --build --force-recreate
```

### Clean up

```bash
# Stop and remove containers
docker-compose -f config/docker/docker-compose.yml down

# Remove volumes (WARNING: deletes database data)
docker-compose -f config/docker/docker-compose.yml down -v

# Remove images
docker-compose -f config/docker/docker-compose.yml down --rmi all
```

## Environment Variables

The Docker setup includes default development environment variables. For production deployment, ensure these environment variables are properly set:

### Backend

- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `DATABASE_URL`: PostgreSQL connection string

### Frontend

- `NEXT_PUBLIC_API_URL`: Backend API URL

## Database Setup

The Supabase container will initialize with the schema from `supabase/migrations/`. If you need to reset the database:

```bash
docker-compose -f config/docker/docker-compose.yml down -v
docker-compose -f config/docker/docker-compose.yml up --build supabase
```

## Troubleshooting

### Port conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # Change 3001 to another available port
```

### Memory issues

Increase Docker Desktop memory allocation to at least 4GB.

### Build failures

Clear Docker cache:

```bash
docker system prune -a
```

### Database connection issues

Ensure the Supabase container is healthy:

```bash
docker-compose -f config/docker/docker-compose.yml ps
docker-compose -f config/docker/docker-compose.yml logs supabase
```

## Development Workflow

1. Make code changes in your IDE
2. Docker volumes will automatically sync changes
3. Frontend/backend will hot-reload automatically
4. Access the application at http://localhost:3000

## Production Deployment

For production deployment:

- Use `docker-compose.yml` without the override file
- Set proper environment variables
- Configure proper secrets management
- Use a reverse proxy (nginx) for SSL termination
- Set up proper logging and monitoring
