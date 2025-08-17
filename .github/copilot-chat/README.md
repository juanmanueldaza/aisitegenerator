# Copilot Chat Modes

These chat presets help automate common maintenance and improvements.

- `production-hardening.md`: Checklist to move the app to production
- `auth-diagnostics.md`: Guide for debugging OAuth PKCE/Device Flow
- `repo-hygiene.md`: Tasks to remove dead files and tighten CI

Chatmode definitions (for Copilot Chat):

- `.github/chatmodes/copilot-expert.chatmode.md` (GitHubDocsRefactorExpert): Refactors .github docs and optimizes Copilot. Entrypoints: analyze_github_folder, refactor_docs_for_copilot, propose_workflows_and_labels, generate_onboarding_instructions.
- `.github/chatmodes/copilot-arch.chatmode.md` (GitHubCopilotArchitect): Standardizes .github architecture and CI (Node 18/20). Entrypoints: analyze_github_architecture, consolidate_copilot_instructions, optimize_workflows, validate_quality_gates.
- `.github/chatmodes/code-fixer.chatmode.md` (CodeFixerEnhancer): Code quality and proactive enhancement specialist. Entrypoints: scan_and_report, propose_fixes, refactor_targeted, docs_and_links_cleanup.

Quick start in Copilot Chat:

- Ask: "Use GitHubCopilotExpert optimize_github_folder to audit our .github and propose changes."
- Or: "Run GitHubCopilotExpert create_project_instructions to regenerate onboarding for this repo."
- Or: "Use GitHubCopilotArchitect analyze_github_architecture to propose .github standardization with diffs."
- Or: "Run CodeFixerEnhancer scan_and_report to find issues and propose PR-ready diffs."
