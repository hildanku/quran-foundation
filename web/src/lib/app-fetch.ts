import type { ExecutionContext } from "hono"

export const appFetch: (
    input: URL | RequestInfo,
    init?: RequestInit,
    Env?: any,
    executionCtx?: ExecutionContext
) => Promise<Response> = async (input, init = {}, _env?, _executionCtx?) => {
    const token = localStorage.getItem('access_token')
    const headers = new Headers(init.headers || {})
    if (token) {
        headers.set('Authorization', `${token}`)
    }

    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }

    const res = await fetch(input, {
        ...init,
        headers,
    })

    if (!res.ok) {
        let errorMessage = 'Request failed'
        try {
            const error = await res.json()
            errorMessage = error.message || errorMessage
        } catch (_) {
            // fallback jika bukan JSON
            const text = await res.text()
            errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
    }

    return res
}
