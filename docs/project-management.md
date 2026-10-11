# Project management

Life Journal has three different kinds of project information. They should not
be copied into several checklists, because the copies quickly disagree.

## GitHub Issues: the working backlog

Use an issue for every feature, bug, technical task, or research question that
someone may actually pick up. An issue is the single source of truth for its
status, discussion, acceptance criteria, and pull request.

Use these labels:

- `type: feature`, `type: bug`, `type: chore`, `type: research`
- `area: journal`, `area: tracker`, `area: auth`, `area: ai`, `area: social`
- `priority: now`, `priority: next`, `priority: later`

Create milestones only for a small shippable outcome, such as `v0.2 Follow-through`
or `v0.3 Reflection`. Close the issue when its behavior is deployed and verified.

## Product roadmap: the direction

[`PRODUCT_ROADMAP.md`](../PRODUCT_ROADMAP.md) describes the product promise and
release-level outcomes. Keep it short. When an outcome becomes real work, link
to its GitHub issues instead of adding a second checklist here.

## Documentation and decision records: durable knowledge

Keep architecture, deployment steps, privacy rules, and decisions in `docs/`.
Add a decision record when a choice changes future implementation, such as the
authentication method, AI provider boundary, or data-retention policy. Do not
use decision records for ordinary implementation tasks.

## Weekly operating rhythm

1. Capture a new thought as an issue with `priority: later`.
2. Before working, promote only one or two issues to `priority: now`.
3. Link the pull request and deployment evidence in the issue, then close it.
4. Once a week, move unfinished work back to `next` or `later` deliberately.
