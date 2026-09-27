# PixelPost Backend Audit

## Scope

Reviewed the backend entry point, all route modules, services, utilities, Mongoose models, package manifest and lockfile, plus client references to backend routes and notification sockets. Reference checks covered the repository outside `node_modules` and ignored environment files. No backend test files or test script were found.

## REMOVE

- `mongodb/models/userPost.js`: removed after reference verification. A repository-wide reference search found no import or model usage; the only matching source file was its own definition. The active post API uses `mongodb/models/post.js`.
- `@azure/cosmos`: no SDK import or API use exists in application source. `connect.js` uses Mongoose, not the Cosmos SDK. This dependency can be removed independently of the database migration.
- `cloudinary`: no source import or use found anywhere in the repository.
- `openai`: no source import or use found in the backend. Image generation currently uses Gemini and Stability AI. The stale `OPENAI_API_KEY` value in local configuration is not consumed by backend code.
- `lodash.debounce`: no source import or use found anywhere in the repository.
- `server` (`file:` self-dependency): no import or source reference found; it points the package at itself and serves no application purpose.

The unused model and dependencies above were removed after this report was recorded. `@azure/storage-blob` is not removable yet: post creation and deletion call the storage implementation.

## SIMPLIFY

- Removed the commented-out older implementation from `routes/userRoutes.js` after checking active routes and client call sites.
- Environment loading is centralized at application startup; redundant route/provider dotenv setup was removed.
- Fixed the admin contests endpoint to return its computed, creation-date-sorted result.
- Removed the unused `email` destructure from post creation.
- Similar-post search loads all posts and computes tag similarity in memory. This is functionally useful today, but its cost grows with collection size; optimize only with measured scale and preserved ordering/pagination behavior.
- `nodemon` is now a development dependency; `start` runs Node directly and `dev` runs nodemon.
- Replaced undeclared transitive `node-fetch` and `form-data` imports with native Node 18 `fetch` and `FormData`.

## REFACTOR

- Storage provider coupling is now isolated: post routes call generic `uploadFile`/`deleteFile` operations through `services/storageService.js`; Azure SDK calls live in `storage/azureBlobStorage.js`. Existing image URLs and best-effort delete behavior are preserved.
- Added a centralized Express error boundary for uncaught middleware errors and JWT validation, and sanitized caught admin, contest, post-creation, and image-generation error responses. Other route-local catches remain to preserve behavior; converting every Express 4 async handler should be a tested follow-up.
- Auth0 verification now uses one shared middleware module for app and contest routes.
- Fixed notification username fallback to import `User` directly, and removed a catch/log/rethrow wrapper with no error-handling value.
- Database startup now accepts `MONGODB_URI` with `COSMOSDB_URL` as a compatibility fallback, awaits the connection before listening, uses a configurable port, and avoids logging connection details.
- Declared `jsonwebtoken` directly because `adminRoutes.js` imports it.
- Admin and contest error responses retain their status and JSON shape but use generic messages instead of exposing provider/database details. Image-generation errors retain their response keys with a generic error value.

## KEEP

- Express route modules, Mongoose models, and the `loginOrCreateUser`, `usernameGenerator`, and `tagSimilarity` utilities have live callers and should not be deleted as cleanup.
- `services/notificationService.js` is used by post and user flows. Socket.IO events are consumed by the client notification context, so Socket.IO is active functionality, not dead code.
- `bcryptjs`, `express-jwt`, `jwks-rsa`, `mongoose`, `cors`, `dotenv`, `express`, and `socket.io` all have active imports/use.
- Existing post, contest, user, admin, notification, and image-generation routes have client references. Preserve their paths and response shapes while cleaning internals.

## MIGRATION-READY

- Mongoose is already the database access layer, so application models and routes do not call a provider-specific database SDK. The app accepts a generic MongoDB URI; the Cosmos-named environment variable is only a compatibility fallback.
- Auth0 JWT verification is an external identity integration rather than an Azure dependency. It can stay if Auth0 remains the identity provider.
- Image generation is already outside Azure: Gemini enhances prompts/tags and Stability AI generates images. These are still vendor integrations and credentials, but they are isolated to `dalleRoutes.js`.
- Socket.IO is provider-agnostic but requires a host that supports persistent connections and shared socket state if horizontally scaled. Confirm target hosting support before migration.
- Azure Blob Storage is the primary remaining Azure SDK integration. Keep its dependency until a replacement provider is selected and the adapter is swapped.

## Dependency Usage

| Package | Usage status | Recommendation |
| --- | --- | --- |
| `@azure/cosmos` | Unused SDK; only Cosmos-specific URI/config naming remains | Remove |
| `@azure/storage-blob` | Used only by current image storage provider | Keep until storage migration; isolate behind adapter |
| `@google/generative-ai` | Used by prompt enhancement and tag extraction | Keep |
| `bcryptjs` | Used by admin password hashing | Keep |
| `cloudinary` | No source imports or references found | Remove |
| `cors` | Used by Express app | Keep |
| `dotenv` | Used by app entry point; redundant route-level calls | Keep package; remove duplicate calls |
| `express` | Used by app and all route modules | Keep |
| `express-jwt` | Used by Auth0 and admin token middleware | Keep |
| `jwks-rsa` | Used for Auth0 key retrieval | Keep |
| `lodash.debounce` | No source imports or references found | Remove |
| `mongoose` | Used by connection and all database models/routes | Keep |
| `nodemon` | Used only by current start script | Keep as a development dependency; use Node for production start |
| `openai` | No source imports or references found in backend | Remove |
| `server` (`file:`) | Self-dependency; no source imports or references found | Remove |
| `socket.io` | Used by server and client notification flow | Keep |
| `node-fetch` | Direct import, but only transitively installed | Replace with native `fetch` (Node 18+) |
| `form-data` | Direct import, but only transitively installed | Replace with native `FormData` (Node 18+) |
| `jsonwebtoken` | Direct import, but only transitively installed via `express-jwt` | Declare as a direct dependency |

No duplicate top-level libraries providing the same active functionality were identified. `package-lock.json` remains lockfile v2 and was regenerated with npm 11.18.0 after dependency cleanup and security updates. `npm audit fix` resolved the compatible-range advisories; the production audit then reported zero vulnerabilities.

## Security And Operational Findings

- The ignored, untracked local `server/.env` contains credential-shaped values. Rotate any credentials that have ever been shared or committed, and continue keeping `.env` out of version control. The audit does not reproduce any values.
- The ignored, untracked local `client/.env` contains a `VITE_CLIENT_SECRET` entry. No client source code references it, but any `VITE_` value used by client code is bundled for browsers. The sample entry was removed from the README; remove the local value and rotate it if it is a real Auth0 secret. Keep confidential credentials server-side only.
- The admin JWT secret has a hard-coded fallback, and `/api/v1/admin/setup` is unauthenticated. Removing the fallback or restricting setup changes security behavior and should be handled explicitly before deployment.
- Several post/user write routes trust caller-supplied user IDs and are not protected by Auth0 middleware. Notification routes are mounted behind Auth0, but their user-ID path parameters are not checked against `req.auth.sub`. Review authorization as a separate behavior/security change; do not assume frontend authentication alone protects these endpoints.
- Admin, contest, post creation, and image-generation responses no longer expose caught provider/database error details. Other route-local catches already return generic messages; internal errors are still logged by some route handlers and should be reviewed before centralizing all async error handling.
- Socket.IO's `join` event accepts any user ID without authenticating the socket, allowing room impersonation unless access is restricted at the socket handshake/join step.
- `Contest` status/date queries and nested contest-entry user queries may benefit from indexes if collection size warrants them. `Notification` has both a standalone `userId` index and a compound `{ userId, createdAt }` index; assess actual query plans before removing the redundant-looking prefix index.
- Socket.IO room joins still accept a client-supplied user ID; protecting the handshake/join flow is a security behavior change and remains an explicit follow-up.

## Verification Notes

The repository has no backend automated test suite. A clean `npm ci` completed successfully; dependency cleanup was checked with `npm ls --depth=0`, the production dependency audit, static diagnostics, and JavaScript syntax checks. `npm start` loaded the app but could not reach the configured database, so the server correctly exited before listening. A successful startup and external-service operations still require a reachable MongoDB-compatible database and valid provider credentials.