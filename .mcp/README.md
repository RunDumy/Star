# MCP gateway (Docker) — quick start

This file documents how to run the MCP gateway locally using Docker, use the provided `docker-compose.mcp.yml`, and how to connect an MCP client (for example `vscode`).

Prerequisites
- Docker installed and running (Docker Desktop or Engine)
- Sufficient permissions to run Docker commands

Start the gateway (recommended) — docker compose

```powershell
# From the repo root
docker compose -f docker-compose.mcp.yml up --build
```

This uses `mcp/gateway:latest` by default. Replace the image name if your org provides a different official image.

Run gateway with `docker run` (if you prefer)

```powershell
docker run --rm -it --name mcp-gateway \
  -p 8080:8080 `
  -v ${PWD}:/workspace \
  mcp/gateway:latest mcp gateway run
```

Connect a client named `vscode`

If your Docker CLI supports `docker mcp` as a plugin you can run:

```powershell
docker mcp client connect vscode --gateway http://localhost:8080
```

If `docker mcp` is not available, use a client image:

```powershell
docker run --rm -it mcp/client:latest client connect vscode --gateway http://host.docker.internal:8080
```

Notes
- On Windows Docker Desktop, when connecting from the host to a container you may use `localhost` or `host.docker.internal` depending on your Docker networking setup.
- If you need the exact image name for gateway or client, replace `mcp/gateway:latest` and `mcp/client:latest` with the image your organization provides.

VS Code tasks
- A local `.vscode/tasks.json` exists in the workspace (not committed, since `.vscode` is ignored). Use Command Palette → Tasks: Run Task → `MCP: Run Docker Gateway` to run `docker mcp gateway run`.

Stopping and cleanup

```powershell
# stop the compose stack
docker compose -f docker-compose.mcp.yml down

# or stop the individual container
docker stop mcp-gateway
```

Troubleshooting
- `docker mcp` unknown subcommand: use the `docker run` form above.
- connection refused: ensure the gateway is listening and the port is mapped.
- client already exists: `docker mcp client disconnect <name>` or use another client name.
