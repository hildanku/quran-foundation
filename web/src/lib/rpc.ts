import { hc } from 'hono/client'
import { BASE_URL } from '@/lib/constant'

// NOTE:
// Originally we imported the backend AppType from the root project to get full
// end-to-end route typing: `import type { AppType } from '@/root/src/main'` and then
// `hc<AppType>(BASE_URL)`. That pulled the backend source tree (with its own
// path alias "@" pointing to the backend src) into the frontend compiler where
// "@" already points to web/src. During `npm run build` this caused TypeScript
// to try to resolve backend imports like '@/routes.js' inside the web folder,
// producing the "Cannot find module '@/routes.js'" errors and failing the Docker build.
//
// Quick unblock: drop the generic so the client is untyped (falls back to an
// index signature / any-like access). This trades strict type safety for a
// successful build. Follow-up (recommended) options are documented in the
// repository or can be implemented later: project references, distinct backend
// alias (e.g. @backend/*), or emitting a generated d.ts schema for routes.
//
// This lets existing usages like client.api.v1.auth.login.$post(...) continue
// to compile (they'll be dynamically typed now).
// Create a very loose type map just for the pieces we call in the frontend.
// Each nested segment eventually exposes an HTTP verb helper returning a Promise<Response>.
// This avoids "Property X does not exist on type never" while keeping implementation simple.
// If you add new endpoints, extend the interface below.
interface LooseVerb {
	$get: (init?: any, requestInit?: RequestInit) => Promise<Response>
	$post: (init?: any, requestInit?: RequestInit) => Promise<Response>
	$delete: (init?: any, requestInit?: RequestInit) => Promise<Response>
}
interface LooseAuth {
	login: LooseVerb
	register: LooseVerb
	logout: LooseVerb
	current_user: LooseVerb
}
interface LooseApiV1 {
	auth: LooseAuth
	surahs: LooseVerb
}
interface LooseClient {
	api: {
		v1: LooseApiV1
	}
}

// Cast the untyped hono client to our loose interface.
// Runtime behavior is still the same; we only widen types.
export const client = hc(BASE_URL) as unknown as LooseClient
