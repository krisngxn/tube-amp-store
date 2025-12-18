#!/bin/bash
# Script to kill processes on common development ports

PORTS=(3000 3001 3002 3003 3004 3005 5432 54321 8080 8000 5000)

echo "Killing processes on common development ports..."

for port in "${PORTS[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
done

# Also kill Next.js and Node dev servers
pkill -f "next dev" 2>/dev/null && echo "Killed Next.js dev servers"
pkill -f "node.*dev" 2>/dev/null && echo "Killed Node dev processes"

echo "Done!"

