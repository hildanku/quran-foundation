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

    // Only set Content-Type for non-FormData requests
    // Let the browser set Content-Type automatically for FormData (multipart/form-data)
    if (init.body instanceof FormData) {
        // Remove any Content-Type header that might have been set
        // The browser will set it automatically with the correct boundary
        headers.delete('Content-Type')
    } else if (!headers.has('Content-Type')) {
        // Only set JSON content type if no Content-Type is already set and it's not FormData
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
