# Reporting a security issue

For a vulnerability involving untrusted files, arbitrary code execution, credentials or private information, use [GitHub private vulnerability reporting](https://github.com/AgenticGameDevs/generated-assets/security/advisories/new). Include affected versions, the smallest reproduction and expected/actual behavior. Do not include real credentials or other people's private files. Private reporting must be enabled by the repository maintainer; if the form is unavailable, open a minimal issue asking for a private reporting channel without exploit details.

Broken previews, incorrect attribution, rights disputes and misleading metadata belong in the asset problem issue form. Only the latest released tooling is actively maintained. Media can be pinned to earlier commits; that does not imply ongoing support for old tooling.

Assets and descriptors from contributors are untrusted inputs. CI validation and hashes reduce accidental corruption and inconsistency; they do not certify that every importer safely handles every file. MCP only reads catalogued metadata/previews and returns download plans. It does not run generation recipes or install contributed code.
