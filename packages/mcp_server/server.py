"""Model Context Protocol (MCP) Server for Invariant Continuous Verification.

Enables any MCP-compatible IDE (VS Code, Cursor, Windsurf, Claude Code, Continue)
to interact directly with Invariant to verify specifications, detect test gaps,
analyze failures with AI (Gemini/OpenAI), and generate automated fix branches.
"""

import sys
import os
import json
from typing import Dict, Any, List

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from packages.spec_engine.parser import SpecParser  # noqa: E402
from packages.verifier.runner import IsolatedRunner  # noqa: E402
from packages.ai_engine.analyzer import AIAnalyzer  # noqa: E402
from packages.ai_engine.factory import get_default_ai_provider  # noqa: E402
from packages.report_engine.normalizer import FindingNormalizer  # noqa: E402
from packages.verifier.fix_generator import FixBranchGenerator  # noqa: E402
from services.api.app.services.test_gap_analyzer import TestGapAnalyzer  # noqa: E402

MCP_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "invariant_verify",
        "description": (
            "Run isolated verification on a project repository against its INVARIANT.md "
            "specification. Executes test suites in a clean sandbox and returns verified passes, "
            "failures, execution traces, and reproduction commands."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "workspace_path": {
                    "type": "string",
                    "description": (
                        "Path to workspace repository root. Defaults to current directory."
                    ),
                    "default": ".",
                },
                "spec_path": {
                    "type": "string",
                    "description": "Path to INVARIANT.md specification file.",
                    "default": "INVARIANT.md",
                },
            },
        },
    },
    {
        "name": "invariant_get_spec",
        "description": (
            "Parse and inspect the declarative INVARIANT.md specification. Returns active "
            "invariants, rules, formal assertions, contracts, and edge cases."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "spec_path": {
                    "type": "string",
                    "description": "Path to INVARIANT.md specification file.",
                    "default": "INVARIANT.md",
                },
                "workspace_path": {
                    "type": "string",
                    "description": "Workspace root directory.",
                    "default": ".",
                },
            },
        },
    },
    {
        "name": "invariant_test_gaps",
        "description": (
            "Perform AST test-gap analysis cross-referencing INVARIANT.md against workspace "
            "test suites. Pinpoints untested invariants and generates starter test sketches."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "spec_path": {
                    "type": "string",
                    "description": "Path to INVARIANT.md specification file.",
                    "default": "INVARIANT.md",
                },
                "workspace_path": {
                    "type": "string",
                    "description": "Workspace root directory.",
                    "default": ".",
                },
            },
        },
    },
    {
        "name": "invariant_suggest_fix",
        "description": (
            "Analyze an invariant violation or test failure using live AI (Gemini / OpenAI or "
            "rule engine). Explains the root cause, suggests code changes, and provides "
            "replacement code."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "invariant_rule": {
                    "type": "string",
                    "description": "The rule statement of the invariant that was violated.",
                },
                "failure_trace": {
                    "type": "string",
                    "description": "The failure execution trace or pytest assertion error.",
                },
                "file_path": {
                    "type": "string",
                    "description": (
                        "Optional relative path to source file where failure occurred."
                    ),
                },
            },
            "required": ["invariant_rule", "failure_trace"],
        },
    },
    {
        "name": "invariant_create_fix_branch",
        "description": (
            "Create a local Git fix branch, apply replacement code, and generate GitHub PR "
            "draft metadata for an invariant violation."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "invariant_id": {
                    "type": "string",
                    "description": "Identifier of the invariant (e.g., INV-001).",
                },
                "finding_title": {
                    "type": "string",
                    "description": "Summary title of the invariant violation finding.",
                },
                "file_path": {
                    "type": "string",
                    "description": "Relative path of file to update.",
                },
                "replacement_code": {
                    "type": "string",
                    "description": "Full replacement code for the target file.",
                },
                "workspace_path": {
                    "type": "string",
                    "description": "Path to git repository root. Defaults to current directory.",
                    "default": ".",
                },
            },
            "required": ["invariant_id", "finding_title"],
        },
    },
]


class InvariantMCPServer:
    """Lightweight stdio-based JSON-RPC Model Context Protocol server."""

    def __init__(self) -> None:
        self.parser = SpecParser()
        self.normalizer = FindingNormalizer()
        self.ai_analyzer = AIAnalyzer(provider=get_default_ai_provider())

    def _resolve_spec(self, spec_path: str, workspace_path: str) -> str:
        if os.path.isabs(spec_path) and os.path.exists(spec_path):
            return spec_path
        if os.path.exists(spec_path):
            return spec_path
        cand = os.path.join(workspace_path, spec_path)
        if os.path.exists(cand):
            return cand
        cand_default = os.path.join(workspace_path, "INVARIANT.md")
        if os.path.exists(cand_default):
            return cand_default
        return cand

    def handle_verify(self, args: Dict[str, Any]) -> str:
        workspace = args.get("workspace_path", ".")
        spec_path = args.get("spec_path", "INVARIANT.md")
        resolved_spec_path = self._resolve_spec(spec_path, workspace)

        spec = None
        if os.path.exists(resolved_spec_path):
            spec = self.parser.parse_file(resolved_spec_path)

        runner = IsolatedRunner(workspace_root=workspace, timeout_seconds=30)
        test_result = runner.auto_verify()

        hypotheses = []
        if spec and spec.invariants:
            hypotheses = self.ai_analyzer.analyze_spec(spec)

        report = self.normalizer.normalize(
            test_result=test_result,
            spec=spec,
            hypotheses=hypotheses,
        )

        output = {
            "run_id": report.run_id,
            "overall_status": report.status.value,
            "duration_ms": report.duration_ms,
            "summary": report.summary,
            "passed_count": report.passed_count,
            "failed_count": report.failed_count,
            "hypothesis_count": report.hypothesis_count,
            "findings": [
                {
                    "id": f.finding_id,
                    "title": f.title,
                    "invariant_id": f.invariant_id,
                    "status": f.status.value,
                    "severity": f.severity,
                    "reproduction_command": f.reproduction_command,
                    "execution_trace": f.execution_trace,
                }
                for f in report.findings
            ],
        }
        return json.dumps(output, indent=2)

    def handle_get_spec(self, args: Dict[str, Any]) -> str:
        workspace = args.get("workspace_path", ".")
        spec_path = args.get("spec_path", "INVARIANT.md")
        resolved = self._resolve_spec(spec_path, workspace)

        if not os.path.exists(resolved):
            return json.dumps(
                {"error": f"Specification file not found at '{resolved}'."}
            )

        spec = self.parser.parse_file(resolved)
        return json.dumps(
            {
                "spec_version": spec.metadata.spec_version,
                "target_system": spec.metadata.target_system,
                "status": spec.metadata.status,
                "verification_level": spec.metadata.verification_level,
                "invariants": [
                    {
                        "id": inv.id,
                        "title": inv.title,
                        "rule_statement": inv.rule_statement,
                        "formal_assertion": inv.formal_assertion,
                        "severity": inv.severity,
                    }
                    for inv in spec.invariants
                ],
                "contracts": [
                    {
                        "name": c.name,
                        "endpoint": c.endpoint,
                        "pre_conditions": c.pre_conditions,
                        "post_conditions": c.post_conditions,
                    }
                    for c in spec.contracts
                ],
            },
            indent=2,
        )

    def handle_test_gaps(self, args: Dict[str, Any]) -> str:
        workspace = args.get("workspace_path", ".")
        spec_path = args.get("spec_path", "INVARIANT.md")
        resolved = self._resolve_spec(spec_path, workspace)

        if not os.path.exists(resolved):
            return json.dumps(
                {"error": f"Specification file not found at '{resolved}'."}
            )

        spec = self.parser.parse_file(resolved)
        analyzer = TestGapAnalyzer(workspace_path=workspace)
        analysis = analyzer.analyze(spec=spec, spec_path=spec_path)

        return json.dumps(
            {
                "spec_path": analysis.spec_path,
                "target_system": analysis.target_system,
                "coverage_percentage": analysis.coverage_percentage,
                "tested_count": analysis.tested_count,
                "untested_gap_count": analysis.untested_gap_count,
                "invariants": [
                    {
                        "id": inv.id,
                        "title": inv.title,
                        "test_coverage_status": inv.test_coverage_status,
                        "associated_tests": inv.associated_tests,
                        "suggested_test_sketch": inv.suggested_test_sketch,
                    }
                    for inv in analysis.invariants
                ],
                "recommendations": analysis.recommendations,
            },
            indent=2,
        )

    def handle_suggest_fix(self, args: Dict[str, Any]) -> str:
        invariant_rule = args.get("invariant_rule", "")
        failure_trace = args.get("failure_trace", "")
        file_path = args.get("file_path", "")

        code_context = ""
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    code_context = f.read()[:3000]
            except Exception:
                pass

        fix_result = self.ai_analyzer.suggest_fix(
            invariant_rule=invariant_rule,
            failure_trace=failure_trace,
            code_context=code_context,
        )
        return json.dumps(fix_result, indent=2)

    def handle_create_fix_branch(self, args: Dict[str, Any]) -> str:
        workspace = args.get("workspace_path", ".")
        generator = FixBranchGenerator(workspace_root=workspace)
        res = generator.create_fix_branch(
            invariant_id=args.get("invariant_id", "INV-FIX"),
            finding_title=args.get("finding_title", "Invariant Violation"),
            file_path=args.get("file_path"),
            replacement_code=args.get("replacement_code"),
        )
        return json.dumps(res, indent=2)

    def execute_tool(self, name: str, args: Dict[str, Any]) -> str:
        if name == "invariant_verify":
            return self.handle_verify(args)
        elif name == "invariant_get_spec":
            return self.handle_get_spec(args)
        elif name == "invariant_test_gaps":
            return self.handle_test_gaps(args)
        elif name == "invariant_suggest_fix":
            return self.handle_suggest_fix(args)
        elif name == "invariant_create_fix_branch":
            return self.handle_create_fix_branch(args)
        else:
            return json.dumps({"error": f"Unknown tool: '{name}'"})

    def run(self) -> None:
        """Read standard input JSON-RPC requests and write responses to stdout."""
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
            except Exception:
                continue

            method = request.get("method")
            req_id = request.get("id")

            if method == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {
                            "name": "invariant-mcp",
                            "version": "0.1.0",
                        },
                    },
                }
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()

            elif method == "notifications/initialized":
                # Client notification after initialize - no response required
                pass

            elif method == "ping":
                response = {"jsonrpc": "2.0", "id": req_id, "result": {}}
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()

            elif method == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"tools": MCP_TOOLS},
                }
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()

            elif method == "tools/call":
                params = request.get("params", {})
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})

                try:
                    tool_output = self.execute_tool(tool_name, tool_args)
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": tool_output,
                                }
                            ]
                        },
                    }
                except Exception as e:
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps({"error": str(e)}),
                                }
                            ],
                            "isError": True,
                        },
                    }

                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()

            else:
                if req_id is not None:
                    response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32601,
                            "message": f"Method '{method}' not found",
                        },
                    }
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()


def main() -> None:
    server = InvariantMCPServer()
    server.run()


if __name__ == "__main__":
    main()
