# ADR 0004: Track habits by explicit periods and preserve completion history

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

A repeating goal needs a clear reset boundary and a record of actual practice.
Showing periods before a habit existed creates misleading history.

## Decision

Habits define a weekly or monthly cadence. Weekly habits select Sunday or Monday
as their period start. Completion rows carry a date and count, so the UI can
show current-period progress, prior periods, and calendar marks beginning at
the habit's creation date.

## Consequences

The tracker never fabricates missed periods before creation. Edits change future
configuration without deleting historical completions.
