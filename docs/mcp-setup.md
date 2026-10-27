# Invariant Model Context Protocol (MCP) Server

Invariant includes a built-in, lightweight **Model Context Protocol (MCP)** server (`packages.mcp_server.server`). This allows any MCP-compatible IDE or assistant—such as **VS Code**, **Cursor**, **Windsurf**, **Claude Desktop**, or **Antigravity**—to directly execute continuous verification, analyze invariant violations with AI, and generate automated fix branches directly inside your editor.

---

## 1. Available MCP Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `invariant_verify` | `workspace_path`, `spec_path` | Runs isolated verification against `INVARIANT.md` and returns passes, failures, and traces. |
| `invariant_get_spec` | `spec_path`, `workspace_path` | Reads and parses active invariants, contracts, and rules from `INVARIANT.md`. |
| `invariant_test_gaps` | `spec_path`, `workspace_path` | Cross-references invariants against test suites and generates starter test sketches. |
| `invariant_suggest_fix` | `invariant_rule`, `failure_trace`, `file_path` | Uses live AI (Gemini 1.5/2.0 or OpenAI) or rule heuristics to diagnose violations and generate code fixes. |
| `invariant_create_fix_branch` | `invariant_id`, `finding_title`, `file_path`, `replacement_code` | Creates a local Git fix branch, applies the patch, and prepares PR metadata. |

---

## 2. Configuration for IDEs

### VS Code (via Copilot MCP / Continue / Roo Code / Cline)
Add the following to your workspace `.vscode/mcp.json` or user settings:

```json
{
  "mcpServers": {
    "invariant": {
      "command": "python",
      "args": ["-m", "packages.mcp_server.server"],
      "env": {
        "GEMINI_API_KEY": "${env:GEMINI_API_KEY}",
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      }
    }
  }
}
```

### Cursor & Windsurf
1. Open **Settings** $\rightarrow$ **Features** $\rightarrow$ **MCP Servers**.
2. Click **Add New MCP Server**:
   * **Name**: `invariant`
   * **Type**: `command`
   * **Command**: `python -m packages.mcp_server.server`

### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "invariant": {
      "command": "python",
      "args": ["-m", "packages.mcp_server.server"],
      "cwd": "c:/Users/Srinivas/Desktop/srini/projects/t2c2-invictus"
    }
  }
}
```

---

## 3. How to Use in Chat
Once connected, you can prompt your IDE assistant:
* *"Check if my changes comply with INVARIANT.md using `invariant_verify`"*
* *"Are there any untested invariant gaps in this project?"*
* *"Analyze this test failure with `invariant_suggest_fix` and create a fix branch."*
