# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Connect pages through the shared API client and add loading, empty, success, and accessible error states. Re-run the frontend tests.
- Logic tier decision: Implement and test the API contracts—activity and team validation/CRUD, leaderboard aggregation/ranking, and user-specific workout suggestions. Re-run the API tests.
- Data tier decision: Use Mongoose models with required-field validation and references; preserve the seed script’s tested idempotency. Re-run the data contract tests.
- Activity tracking approach:  Validate user/team IDs and existence, then store the activity with computed points and an occurrence date.
- Team management approach: Create and list teams with their submitted names, mascots, and members; reject a missing name with 400
- Leaderboard approach: Sum activity points by team, sort highest first, and assign ranks starting at 1
- Workout suggestions approach: Match the user by email and recommend workouts based on their goal or recent activity, with an explanatory reason; return a 4xx for an unknown user.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`  4 failures, 1 pass. Required-field validation fails for user, team, activity, and workout models; the seed/idempotency test passes.
- API command: `npm run test:api --prefix octofit-tracker/backend` 4 failures. Activity and team creation return 501 instead of rejecting invalid input with 400; leaderboard is empty; workout suggestions lack the expected reason.
- Frontend command: `npm test --prefix octofit-tracker/frontend` all 15 failures. Routes still show “Implementation pending,” so data rendering, loading/empty states, and accessible error states are absent
- Backend build command: `npm run build --prefix octofit-tracker/backend` Passed
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` Passed
