"""Unit tests for Invariant Model Context Protocol (MCP) server and AI providers."""

import json
from packages.mcp_server.server import InvariantMCPServer, MCP_TOOLS
from packages.ai_engine.providers.gemini_provider import GeminiAIProvider
from packages.ai_engine.factory import get_default_ai_provider
from packages.verifier.fix_generator import FixBranchGenerator


def test_mcp_tools_list() -> None:
    """Verify MCP tools schema definitions."""
    tool_names = [t["name"] for t in MCP_TOOLS]
    assert "invariant_verify" in tool_names
    assert "invariant_get_spec" in tool_names
    assert "invariant_test_gaps" in tool_names
    assert "invariant_suggest_fix" in tool_names
    assert "invariant_create_fix_branch" in tool_names


def test_mcp_server_get_spec() -> None:
    """Test invariant_get_spec tool on inventory reference spec."""
    server = InvariantMCPServer()
    res_str = server.execute_tool(
        "invariant_get_spec",
        {"spec_path": "examples/inventory-api/INVARIANT.md"},
    )
    res = json.loads(res_str)
    assert res["target_system"] == "InventoryService"
    assert len(res["invariants"]) == 3
    assert res["invariants"][0]["id"] == "INV-01"


def test_mcp_server_test_gaps() -> None:
    """Test invariant_test_gaps tool on inventory spec and workspace."""
    server = InvariantMCPServer()
    res_str = server.execute_tool(
        "invariant_test_gaps",
        {
            "spec_path": "examples/inventory-api/INVARIANT.md",
            "workspace_path": "examples/inventory-api",
        },
    )
    res = json.loads(res_str)
    assert res["target_system"] == "InventoryService"
    assert res["tested_count"] == 3
    assert res["coverage_percentage"] == 100.0


def test_mcp_server_suggest_fix_offline() -> None:
    """Test invariant_suggest_fix tool with heuristic fallback."""
    server = InvariantMCPServer()
    res_str = server.execute_tool(
        "invariant_suggest_fix",
        {
            "invariant_rule": "Stock quantity for any SKU must never drop below 0.",
            "failure_trace": "AssertionError: Expected balance >= 0, but received -3 (underflow)",
        },
    )
    res = json.loads(res_str)
    assert "root_cause" in res
    assert "suggested_fix" in res
    assert (
        "balance" in res["root_cause"].lower()
        or "atomic" in res["suggested_fix"].lower()
    )


def test_fix_branch_generator_dry_run() -> None:
    """Test fix branch metadata generation."""
    gen = FixBranchGenerator(workspace_root=".")
    result = gen.create_fix_branch(
        invariant_id="INV-001",
        finding_title="Non-Negative Stock Underflow",
    )
    assert "branch_name" in result
    assert "fix/invariant-inv-001" in result["branch_name"]
    assert "pr_title" in result
    assert "INV-001" in result["pr_title"]


def test_gemini_provider_structure() -> None:
    """Test Gemini provider initialization and prompt structure."""
    prov = GeminiAIProvider(api_key="test-key-mock", model_name="gemini-1.5-flash")
    assert prov.provider_name() == "gemini"
    assert "test-key-mock" in prov.endpoint_url
    # Without real network API key, it should safely return empty list / fallback
    res = prov.generate_hypotheses(
        type(
            "Payload",
            (),
            {
                "target_system": "TestApp",
                "invariants": [],
                "diff_content": "",
            },
        )()
    )
    assert isinstance(res, list)


def test_factory_fallback() -> None:
    """Verify default provider returns mock or configured provider without crashing."""
    provider = get_default_ai_provider()
    assert provider is not None
    assert hasattr(provider, "generate_hypotheses")
