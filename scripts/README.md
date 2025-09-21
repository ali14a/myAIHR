# Fresh Start Script

This directory contains scripts for managing the Resume Scanner application.

## Fresh Start Script (`fresh-start.sh`)

The fresh start script provides a convenient way to kill all running services and start both frontend and backend servers cleanly.

### Features

- **Kills all services**: Automatically terminates any running frontend, backend, or Docker services
- **Port management**: Checks and frees up ports 3000, 5173, and 8000
- **Process tracking**: Uses PID files to track running processes
- **Logging**: Redirects server output to log files for debugging
- **Status monitoring**: Shows current status of running services

### Usage

#### Direct Script Usage

```bash
# Start fresh (kill all and start both servers)
./scripts/fresh-start.sh
./scripts/fresh-start.sh start

# Stop all services
./scripts/fresh-start.sh stop

# Show current status
./scripts/fresh-start.sh status

# Show help
./scripts/fresh-start.sh help
```

#### NPM/Yarn Scripts

```bash
# Start fresh
yarn fresh-start
npm run fresh-start

# Stop all services
yarn fresh-stop
npm run fresh-stop

# Show status
yarn fresh-status
npm run fresh-status
```

### What It Does

1. **Kill Phase**:
   - Terminates processes on ports 3000, 5173, and 8000
   - Kills Node.js processes (Vite, npm, yarn)
   - Kills Python processes (FastAPI, uvicorn)
   - Stops Docker containers

2. **Start Phase**:
   - Starts backend server (FastAPI on port 8000)
   - Starts frontend server (Vite on port 3000)
   - Creates PID files for process tracking
   - Redirects output to log files

3. **Monitoring**:
   - Checks if ports are available
   - Verifies processes are running
   - Shows service status and URLs

### Log Files

- Backend logs: `logs/backend.log`
- Frontend logs: `logs/frontend.log`
- Process IDs: `logs/backend.pid`, `logs/frontend.pid`

### Prerequisites

- Backend virtual environment must exist (`backend/venv/`)
- Frontend dependencies must be installed (`frontend/node_modules/`)
- Python 3.9+ and Node.js 18+ must be installed

### Troubleshooting

If services fail to start:

1. Check the log files for error messages
2. Ensure all dependencies are installed (`yarn setup`)
3. Verify ports are not being used by other applications
4. Check if virtual environment exists and is properly configured

### Integration with Existing Scripts

The fresh start script works alongside the existing development scripts:

- `yarn dev` - Start both servers with hot reload
- `yarn fresh-start` - Kill all and start fresh
- `yarn stop` - Stop services (via existing dev.sh)
- `yarn fresh-stop` - Stop services (via fresh-start.sh)

