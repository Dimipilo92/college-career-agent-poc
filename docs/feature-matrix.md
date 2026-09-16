# Feature delivery matrix

This matrix is the source of truth for experience delivery. Existing features are the baseline; planned work extends the listed scaffold and does not replace delivered paths.

## Status definitions

| Status | Meaning |
| --- | --- |
| Delivered | Implemented, documented, and covered by the build or smoke test. |
| Scaffolded | Extension point and contract exist; product behavior remains to be added. |
| Planned | Product intent is known, but its contract or dependency still needs definition. |

## Delivery matrix

| Experience | Status | Existing baseline | Additive extension point | Acceptance check |
| --- | --- | --- | --- | --- |
| Visual goal intake | Delivered | Four-step MCP App with multi-select, custom answer, Back, Skip, and Submit | `src/experiences/goal-planner/` via the experience catalog | App renders all four states; gallery renders the reusable panel; smoke test saves a goal through `save_goal`. |
| Conversational goal intake | Delivered | Text fallback using the same `save_goal` contract | `appPackage/instruction.txt` | Agent can complete and revise the four answers without opening an app. |
| Career Coach recommendations | Delivered | Two recommendations returned after goal submission | `careerCoach.ts` recommendation adapter | Smoke test verifies recommendation source and schema. |
| Goal summary | Delivered | Focus, cadence, recommendation source, and edit action | Goal planner result renderer | Saved goal can be retrieved with `get_goal`. |
| Resume handoff | Scaffolded | Optional `resumeUrl` exists in the goal contract | `src/experiences/resume-handoff/` and a dedicated MCP tool | User can attach or link a resume after goal creation and revisit that step. |
| Coaching dashboard | Delivered | Goal summary and recommendation cards establish the data inputs | `src/experiences/coaching-dashboard/` | Gallery and MCP App show goal, recommended, active, and completed sections. |
| Activity lifecycle | Scaffolded | Start and complete tools persist activity transitions | `src/domain/activities.ts` plus dedicated activity MCP tools | Add request-alternative behavior and preserve all actions through a later `get_goal` call. |
| Durable goal state | Scaffolded | Atomic local JSON storage survives server restarts | `src/storage/goal-store.ts` | Replace local single-user storage with tenant/user-scoped production persistence. |
| Remote MCP hosting | Scaffolded | Streamable HTTP endpoint and environment-driven port already work | `infra/` and deployment pipeline | Authenticated HTTPS endpoint passes the existing smoke test outside localhost. |
| Authentication and authorization | Planned | Development endpoint is intentionally anonymous | HTTP middleware in `main.ts` and tenant app registration | Requests require an accepted tenant/user token and reject invalid audiences. |
| Activity library | Planned | Goal-specific recommendations avoid a confusing generic menu | `src/experiences/activity-library/` | Activities are filtered by the saved goal and can be launched from the dashboard. |
| Flashcards | Planned | Activity cards provide the launch surface | `src/experiences/flashcards/` | User can complete a deck and record progress. |
| Career-interest quiz | Planned | Elicitation panel supports guided questions | `src/experiences/career-quiz/` | Quiz produces explainable career matches that can seed a goal. |
| Occupation comparison | Planned | Recommendation cards establish comparable content patterns | `src/experiences/occupation-comparison/` | User can compare two occupations across agreed dimensions. |
| Mock interview | Planned | Career Coach recommendation can initiate practice | `src/experiences/mock-interview/` | User completes a guided interview and receives actionable feedback. |
| Picture and voice feedback | Planned | Conversational agent provides the entry point | `src/experiences/media-feedback/` | Supported media is submitted with explicit consent and receives scoped feedback. |
| Guided bootcamp journey | Planned | Goal cadence supplies milestone timing | `src/experiences/bootcamp/` | A multi-week plan exposes current milestone, next action, and progress. |
| Proactive Teams coaching | Planned | Saved goals and cadence define notification intent | `src/notifications/` | Opted-in users receive tenant-compliant reminders and can disable them. |

## Extension rules

1. Keep the visual and conversational goal paths working.
2. Add each user-visible experience under `src/experiences/<experience-name>/`.
3. Give every MCP App its own `ui://coach/...` resource and narrowly scoped tool.
4. Add a representative state to the widget gallery before wiring the server tool.
5. Put shared business contracts under `src/domain/`; put persistence behind `src/storage/`.
6. Extend `scripts/smoke.ts` for every new tool, resource, or persisted transition.
7. Update this matrix in the same change that advances a feature status.

## Next delivery slice

The next coherent slice is the coaching dashboard scaffold:

1. Extract shared goal and recommendation contracts into `src/domain/`.
2. Add dashboard fixtures and a gallery renderer under `src/experiences/coaching-dashboard/`.
3. Add activity status contracts without changing current recommendation behavior.
4. Wire activity tools only after the gallery states are approved.