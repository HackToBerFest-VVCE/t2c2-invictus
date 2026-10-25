# How to Use Invariant

Invariant is a continuous software verification platform that checks code changes against project requirements, runs automated checks, and identifies potential bugs with supporting evidence.

This guide explains how to use Invariant from setup to reviewing verification results.

## 1. Prerequisites

Before using Invariant, ensure you have:

* Git installed.
* A GitHub account and a repository to verify.
* Python and Node.js installed if required by the project's development setup.
* An AI API key if AI-assisted analysis is enabled.
* Access to a running Invariant instance or the local development environment.

> Note: Installation commands depend on the final project structure and supported deployment method.

## 2. Connect Your Repository

1. Open the Invariant application.
2. Sign in and authorize access to the GitHub repository you want to verify.
3. Select the repository.
4. Configure the verification options available for your project.
5. Ensure the repository contains an `INVARIANT.md` file describing its expected behaviour.

Invariant uses the repository's requirements as a reference when analysing code changes.

## 3. Define Requirements

Create an `INVARIANT.md` file in your repository's root directory.

Document important rules, expected behaviour, constraints, and edge cases that your software must satisfy.

### Example: Inventory API

```markdown
# Project Invariants

## Inventory Rules

- Inventory quantity must never become negative.
- A sale must not exceed the available stock.
- Invalid quantities must be rejected.
- Failed transactions must not modify inventory.
```

Write requirements clearly and make them specific enough to verify.

## 4. Submit a Code Change

Make a change to your application and push it to GitHub through a branch or pull request.

When the configured verification workflow is triggered, Invariant can:

1. Retrieve the relevant code changes.
2. Read the project's documented requirements.
3. Run supported automated checks.
4. Analyse potential bugs and overlooked edge cases.
5. Collect evidence and prepare verification findings.

The checks performed depend on the configured tools and supported project environment.

## 5. Review Verification Results

Open the verification report in Invariant or the configured GitHub integration.

Review each finding for:

* **Title:** A short description of the suspected issue.
* **Severity:** The estimated importance of the issue.
* **Requirement:** The rule that may have been violated.
* **Evidence:** Test results, reproducible behaviour, or other supporting information.
* **Suggested fix:** A possible way to address the issue.
* **Status:** Whether the finding is unconfirmed, confirmed, resolved, or otherwise classified by the application.

AI-generated suggestions should be reviewed rather than treated as proven bugs. A finding should be confirmed only when sufficient evidence supports it.

## 6. Fix and Re-verify

1. Inspect the reported issue.
2. Reproduce the problem when possible.
3. Update the code or tests to address it.
4. Submit the fix.
5. Run verification again.
6. Review the new results to ensure the issue is addressed and no new regressions have been introduced.

## 7. Best Practices

* Keep `INVARIANT.md` up to date as requirements change.
* Document critical business rules explicitly.
* Include meaningful automated tests.
* Review evidence before accepting AI-generated findings.
* Never commit API keys, passwords, or other secrets.
* Run repository code only in an appropriately isolated environment.
* Treat verification results as decision support, not a guarantee that software is bug-free.

## 8. Troubleshooting

| Problem                        | What to check                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Repository cannot be connected | Check GitHub authorization and repository permissions.                                  |
| Requirements are not detected  | Ensure `INVARIANT.md` exists in the expected location and uses clear Markdown headings. |
| Automated checks fail          | Inspect the logs, dependencies, configuration, and test commands.                       |
| AI analysis is unavailable     | Check the AI API configuration, credentials, and service availability.                  |
| A finding appears incorrect    | Review its evidence and attempt to reproduce the reported behaviour.                    |

## 9. Important Note

Invariant helps developers identify potential defects and requirement violations earlier in the development process. Its effectiveness depends on the quality of documented requirements, supported checks, available evidence, and the configuration of the verification environment.

A successful verification run does not guarantee that the application is free from bugs.
