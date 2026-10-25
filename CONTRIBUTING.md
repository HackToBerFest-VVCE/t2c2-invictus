# Contributing to Invariant

Thank you for your interest in contributing to **Invariant**! We welcome contributions from developers, researchers, technical writers, and open-source enthusiasts during Hacktoberfest and beyond.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please be respectful, constructive, and collaborative in all discussions and pull requests.

---

## 2. Prerequisites

Before setting up Invariant locally, ensure you have installed:
* **Git** (version 2.30+)
* **Python** (version 3.11 or higher)
* **Node.js** (version 18 LTS or higher, for UI components)
* **Docker** (optional, recommended for runner sandbox testing)
* **Make** or equivalent build tool (optional)

---

## 3. Local Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/HackToBerFest-VVCE/t2c2-invictus.git
   cd t2c2-invictus
   ```

2. **Set Up a Virtual Environment (Python)**:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```

3. **Install Development Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install flake8 black mypy pytest pytest-cov
   ```

4. **Verify Environment**:
   ```bash
   python --version
   git status
   ```

---

## 4. Development Workflow

1. **Create a Feature Branch**:
   Always branch off `main` using a descriptive name:
   ```bash
   git checkout -b feature/spec-parser-ast
   # or
   git checkout -b fix/webhook-hmac-timing
   # or
   git checkout -b docs/threat-model-updates
   ```

2. **Make Incremental Commits**:
   Keep commits focused on a single change or fix. Write clear, imperative commit messages.

3. **Verify Locally Before Pushing**:
   Ensure code formatting, type checking, and tests pass locally.

---

## 5. Coding Conventions

* **Python Style**: Follow [PEP 8](https://peps.python.org/pep-0008/). Code is formatted with `black` (88 character line limit) and checked with `flake8`.
* **Type Annotations**: All new Python functions and class methods must include explicit type annotations. Code must pass `mypy --strict`.
* **Docstrings**: Public modules, classes, and methods must have Google-style or PEP 257 docstrings describing inputs, outputs, exceptions, and invariant guarantees.
* **No Unvetted Dependencies**: Do not introduce heavy third-party dependencies without prior discussion in an issue.

---

## 6. Testing Requirements

* **Test Coverage**: All bug fixes and new features must be accompanied by automated tests.
* **Deterministic Tests**: Tests must run without network access and without non-deterministic race conditions.
* **Running Tests**:
  ```bash
  pytest -v --cov=.
  ```
* **Property-Based Testing**: Where applicable, use Hypothesis or generative fuzzing to test boundary invariants.

---

## 7. Branch and Pull Request Guidance

1. **PR Title Format**: Use conventional commit titles:
   * `feat: add markdown AST lexer for INVARIANT.md`
   * `fix: correct timing vulnerability in HMAC signature check`
   * `docs: update verification model schema examples`
   * `refactor: simplify findings classification pipeline`
2. **PR Description**: Include:
   * Context and motivation for the change.
   * Linked issue (`Closes #12`).
   * Concrete testing steps and command outputs.
   * If Copilot was used, include the development log format (see [docs/copilot-development.md](docs/copilot-development.md)).
3. **CI Checks**: Ensure all required automated checks pass before requesting maintainer review.

---

## 8. Commit Message Recommendations

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
<type>(<scope>): <short imperative summary>

[optional body explaining motivation and trade-offs]

[optional footer: Closes #123]
```

Examples:
* `feat(spec): add YAML frontmatter parser for INVARIANT.md`
* `fix(runner): enforce 300-second execution timeout in container sandbox`
* `docs(readme): add sequence diagram and architecture links`

---

## 9. Bug Reporting

If you discover a bug or unexpected behavior:
1. Check the existing GitHub Issues to avoid duplicate reports.
2. Open a new issue using a descriptive title.
3. Provide:
   * System environment (OS, Python version, Docker version).
   * Exact steps to reproduce the issue.
   * Expected vs. actual behavior.
   * Complete terminal output and stack traces.

---

## 10. Documentation Contributions

High-quality documentation is a first-class citizen in Invariant:
* Documentation files live in the `docs/` directory and root markdown files.
* Verify that all relative links point to existing files.
* Ensure Mermaid diagram syntax is valid and renders cleanly in GitHub's Markdown viewer.
* Avoid marketing exaggerations or claims of unimplemented features; clearly indicate `[Planned]` status where appropriate.

---

## 11. Security Issue Reporting

Please **do not** open public GitHub issues for sensitive security vulnerabilities.

If you discover a vulnerability (such as a sandbox escape, token leakage, or authentication bypass), report it responsibly to the project maintainers via email at:
`security@invariant.dev` (or the repository administrators).

Please include:
* Description of the vulnerability.
* Proof of concept or reproduction steps.
* Potential impact assessment.
