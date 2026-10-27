"""REST API endpoints for Model Context Protocol (MCP) tool discovery and execution."""

import json
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from packages.mcp_server.server import InvariantMCPServer, MCP_TOOLS

router = APIRouter(prefix="/v1/mcp", tags=["Model Context Protocol (MCP)"])

server = InvariantMCPServer()


class MCPExecuteRequest(BaseModel):
    tool_name: str = Field(..., description="Name of the MCP tool to execute")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Arguments for the tool")


class MCPExecuteResponse(BaseModel):
    tool_name: str
    status: str
    result: Any


@router.get("/tools")
def list_mcp_tools() -> List[Dict[str, Any]]:
    """List all available Model Context Protocol (MCP) tools and their JSON schemas."""
    return MCP_TOOLS


@router.post("/execute", response_model=MCPExecuteResponse)
def execute_mcp_tool(request: MCPExecuteRequest) -> MCPExecuteResponse:
    """Execute an MCP tool directly through the web API playground."""
    valid_tools = {t["name"] for t in MCP_TOOLS}
    if request.tool_name not in valid_tools:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown MCP tool '{request.tool_name}'. Available: {sorted(valid_tools)}",
        )

    try:
        raw_output = server.execute_tool(request.tool_name, request.arguments)
        try:
            parsed = json.loads(raw_output)
        except Exception:
            parsed = raw_output

        return MCPExecuteResponse(
            tool_name=request.tool_name,
            status="success",
            result=parsed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCP tool execution failed: {str(e)}")
