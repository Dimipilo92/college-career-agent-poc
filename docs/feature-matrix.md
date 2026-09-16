# Feature delivery matrix

This matrix tracks the thin Career Coach wrapper and Figma-derived interaction surfaces.

## Status definitions

| Status | Meaning |
| --- | --- |
| Delivered | Implemented, documented, and covered by the build or smoke test. |
| Scaffolded | Extension point and contract exist; product behavior remains to be added. |
| Planned | Product intent is known, but its contract or dependency still needs definition. |

## Demo capability tests

For this demo, **Greenlight** means the capability can run in chat through Career Coach. **Experimental UI** means Copilot can call Career Coach and then map its grounded result into the read-only `present_coach_results` MCP App. **Stretch** means the experience still needs persistence, document handoff, or another unsupported contract.

| # | Capability to test | What we are trying to prove | Golden query / follow-up | What good looks like | Likely experience | Demo decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Understand student context | Can the agent turn interests, goals, constraints, location, grade level, and other details into useful context? | “I’m a junior, work 15 hours a week, like healthcare, and don’t want eight years of school.” | It identifies the important constraints without repeating everything or asking unnecessary questions. | Chat | **Greenlight:** Career Coach to chat. |
| 2 | Clarify intelligently | Does it know when more information is actually needed? | “I want a good healthcare career.” | It asks one useful question about training tolerance, location, interests, or priorities instead of a long intake interrogation. | Chat | **Greenlight:** Career Coach to chat. |
| 3 | Set and refine a goal | Can it convert conversation into a concrete student goal and revise it? | “Help me set a career goal.” → “Actually, keeping college costs low matters too.” | The goal is specific and updates when priorities change. | Chat; self-contained goal card candidate | **Greenlight:** chat. A user-populated goal editor may be added; persistence is not implied. |
| 4 | Retain context across turns | Does the agent remember the student’s constraints as the conversation continues? | “What careers fit me?” → “Compare those.” → “Which one works with my schedule?” | The student does not need to restate that they work 15 hours per week or repeat other prior constraints. | Chat | **Greenlight:** conversation context to Career Coach. |
| 5 | Invoke the right Coach capability | Does it recognize when it needs occupation, education, jobs, skills, research, or another capability? | Career exploration versus college search versus job search prompts. | It selects the correct capability instead of hallucinating or using the wrong data source. | Invisible agent behavior | **Greenlight:** direct Career Coach tool selection. |
| 6 | Ground career exploration | Can Career Coach answer a basic career question with useful evidence? | “What is it actually like to be a respiratory therapist?” → “What skills should I work on now?” | Duties, preparation, skills, outlook, tradeoffs, and the next action are coherent and grounded. | Chat | **Greenlight:** Career Coach to chat. |
| 7 | Compare multiple pathways | Can the agent combine several careers into a decision rather than three disconnected descriptions? | “Compare RN, radiologic technologist and respiratory therapist for me.” | It uses consistent dimensions and explains the tradeoffs. | Interactive app candidate | **Experimental UI:** Career Coach → `present_coach_results`. |
| 8 | Re-rank when priorities change | Can recommendations respond to changing student preferences? | “Shorter training matters most.” → “Actually, job growth matters more than salary.” | The ranking changes appropriately and explains why. | Interactive app | **Experimental UI:** rerun Career Coach, then present the updated grounded options. |
| 9 | Explain a recommendation | Does it show its reasoning in student-friendly terms? | “Why are you recommending respiratory therapy for me?” | It ties the recommendation to the student’s stated goals and evidence instead of generic advice. | Chat | **Greenlight:** Career Coach to chat. |
| 10 | Constraint-aware planning | Can it turn career information into a realistic plan? | “I’m a junior, work 15 hours/week, have average grades, and my school has limited advanced courses. What can I realistically do this semester?” | It gives a manageable plan that respects time, school access, and stated goals. | Chat; plan artifact candidate | **Greenlight in chat; stretch for artifact:** the artifact would require Career Coach output. |
| 11 | Search education/program options | Can it move from career choice to education pathways? | “Find affordable nursing programs in Texas.” → “Compare these three for me.” | Relevant programs, useful comparison fields, evidence, links, and limitations are clear. | Artifact / interactive comparison | **Experimental UI:** Career Coach → `present_coach_results`. |
| 12 | Search current opportunities | Can it retrieve current jobs or internships rather than generic occupation information? | “Find entry-level medical assistant jobs near Anaheim.” → “Only show recently posted ones.” | Results are current, geographically accurate, sensibly filtered, and include useful links. | Chat / interactive results | **Experimental UI:** Career Coach → `present_coach_results`. |
| 13 | Work with a student document | Can it use an uploaded resume rather than merely notice that it exists? | Attach a resume → “What is the weakest part for this career goal?” → “Rewrite one bullet.” | Feedback references real resume content and remains tied to the goal. | Chat; document artifact candidate | **Greenlight in chat where the host supplies the document; stretch for artifact orchestration.** |
| 14 | Produce a durable artifact | Does the task create something the student can retain after chat? | “Turn this into my 90-day plan.” | It creates a structured, reusable plan instead of another long chat message. | Artifact | **Stretch:** requires conversation or Career Coach output plus persistence. |
| 15 | Support richer visual interaction | Is there a case where chat is technically possible but noticeably worse? | Compare careers → change priorities or filter options. | The student can scan alternatives, adjust priorities, and see results update. | Interactive MCP App | **Experimental UI:** host-orchestrated read-only results; in-app filtering remains stretch. |
| 16 | Handle missing data/tool failure | What happens when the capability cannot answer reliably? | Ask for unavailable geography or data, or force a failed result. | It says what it cannot verify, offers an alternative, and does not invent data. | Chat fallback | **Greenlight:** explicit chat fallback. |
| 17 | Distinguish advice from action | Does it recognize an action outside Career Coach? | “Apply to these internships for me.” | It separates coaching from an external action that requires permission and integration. | Gap / future integration | **Greenlight as a boundary response; external action remains out of scope.** |

## Delivery matrix

| Experience | Status | Existing baseline | Additive extension point | Acceptance check |
| --- | --- | --- | --- | --- |
| Career Coach catalog | Delivered | The live upstream catalog is discovered and proxied without local coaching logic | `src/integrations/career-coach.ts` | Smoke test finds representative guidance, assessment, occupation, and interview tools. |
| Career Coach guidance | Delivered | Guidance passes through without local coaching logic | `GetCareerCoachingGuidance` | Smoke test verifies the upstream topic ID and guidance. |
| Conversational shell | Delivered | Copilot selects specialized COACH tools or published topic guidance | `appPackage/instruction.txt` | Agent asks only what is needed to route or follow COACH guidance. |
| Career Coach results UI | Delivered | Copilot maps grounded Career Coach options into a read-only comparison surface | `src/ui/experiences/coach-results/` | Smoke test verifies the presentation tool, payload, and HTML resource. |
| Other complex task UI | Planned | Figma references and elicitation primitives remain inactive | `src/ui/experiences/` | Add a reviewed, tested MCP App only when the interaction requires one. |
| Remote MCP hosting | Scaffolded | Streamable HTTP endpoint and environment-driven port already work | `infra/` and deployment pipeline | Authenticated HTTPS endpoint passes the existing smoke test outside localhost. |
| Authentication and authorization | Planned | Development endpoint is intentionally anonymous | HTTP middleware in `main.ts` and tenant app registration | Requests require an accepted tenant/user token and reject invalid audiences. |

## Extension rules

1. Keep coaching logic in Career Coach; local tools should proxy it or present only self-contained experiences.
2. Do not add a fixed intake flow unless the product requirements explicitly call for one.
3. Register an MCP App resource only for a reviewed complex interaction.
4. Preserve reviewed Figma UI assets under `src/ui/` even when they are not active runtime surfaces.
5. Extend `scripts/smoke.ts` for every new tool or contract change.
6. Update this matrix in the same change that advances a feature status.
7. Host orchestration may pass Career Coach output into `present_coach_results`; preserve the source facts and fall back to chat when the payload cannot be grounded.