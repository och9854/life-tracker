# Life Journal documentation

This directory records the product's current shape and the decisions that led to it.
It is written so the service can be changed without relying on chat history.

| Document | Purpose |
| --- | --- |
| [Architecture](architecture.md) | System boundaries, data flow, and data ownership |
| [Operations](operations.md) | Safe deployment, secrets, and validation |
| [Decision records](decisions/) | Durable choices and their trade-offs |

Decision records are append-only. When a decision changes, add a new record that
supersedes the earlier one instead of rewriting history.
