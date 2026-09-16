# Community and stewardship

Generated Assets is an open contribution library. Its initial maintainer is [Jonathan Maddison](https://github.com/jonathanwmaddison). The catalog started with Fjordfall and SKYBOUND; additional creators and collections are welcome. This is an initial governance process, not a claim that a larger maintainer team already exists.

## Roles

- **Contributors** propose assets, recipes, metadata corrections and code through PRs. They retain authorship and choose an accepted open license.
- **Reviewers** help inspect previews, usability, provenance and tests. Anyone can review and report issues; comments do not grant merge authority.
- **Maintainers** make final inclusion decisions, merge approved contributions, handle reports and maintain releases. New maintainers may be invited after sustained constructive contributions and review work; appointments and changes are announced in a public governance issue.

## How decisions are made

Ordinary asset submissions use the review checklist below. New formats, license policies, breaking schema changes or major redesigns should start in an issue so contributors can discuss the proposal. The maintainer records the decision and reasoning publicly. Disagreements should address the asset or policy; contributors may ask for reconsideration with additional evidence.

## Review checklist

1. Is the asset useful, accurately described and scoped to this library?
2. Are creator attribution, generator/source and reference rights documented? Does the selected license allow open redistribution and modification?
3. Does the preview show this exact file? Inspect the model, important animation clips, texture transparency/repetition, or the full audio clip.
4. Are scale, extensions, rig requirements and limitations candid? Passing a parser does not make an asset production-ready.
5. Does `Validate library` pass, and do changes avoid unrelated files or private material?
6. For code/tooling changes, review execution and file/network behavior. Do not execute an unfamiliar contributed generator just to inspect an asset.

Maintainers merge only after completing this review. CI does not grant merge approval. `CODEOWNERS` requests the initial maintainer's review; enforcement requires GitHub branch rules. Configure `main` to require PRs and the `validate` status check; additional approval requirements become practical as the maintainer group grows. The workflows themselves do not pretend to enforce a review rule that is absent in repository settings.

## Publishing and compatibility

Every merged change to `main` is validated again, and GitHub Pages publishes only after that check succeeds. PRs get validation, not production deployment. Asset IDs remain stable for compatible changes. For repeatable integrations, pin a Git commit and use the recorded checksum; the public Pages URL follows `main` and may change.

Report mistaken metadata, broken downloads or rights concerns through the asset problem form. For credible rights concerns, maintainers can temporarily remove the affected item from the public catalog while investigating; retain a public explanation without exposing personal information. Removing a file cannot revoke licenses already legitimately granted to recipients. Security vulnerabilities that should not be public can be reported through GitHub's private vulnerability reporting when enabled.

## Participation

Be considerate, credit other people's work, and give specific, actionable feedback. Harassment, impersonation, malicious submissions and knowingly false rights claims are not welcome. Maintainers may hide abusive content or restrict repeated abuse, explaining moderation actions where practical without exposing private information.
