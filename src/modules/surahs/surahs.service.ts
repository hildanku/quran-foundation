interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

interface CachedToken {
    access_token: string
    expires_at: number
}

// In-memory token cache
let tokenCache: CachedToken | null = null

// Get OAuth2 access token from Quran Foundation API with caching mechanism
export async function getAccessToken(): Promise<string> {
    if (tokenCache && Date.now() < tokenCache.expires_at) {
        return tokenCache.access_token
    }

    const clientId = process.env.QF_CLIENT_ID
    const clientSecret = process.env.QF_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error('QF_CLIENT_ID and QF_CLIENT_SECRET environment variables are required')
    }

    try {
        const credentials = btoa(`${clientId}:${clientSecret}`)
        
        const response = await fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'content',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('OAuth2 Error:', errorData)
            throw new Error(`OAuth2 token request failed: ${response.status} ${response.statusText}`)
        }

        const tokenData: TokenResponse = await response.json()

        // Cache the token with expiry time (subtract 60 seconds for safety margin)
        tokenCache = {
            access_token: tokenData.access_token,
            expires_at: Date.now() + (tokenData.expires_in - 60) * 1000,
        }

        return tokenData.access_token
    } catch (error) {
        throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export async function fetchChapters(): Promise<any> {
    const accessToken = await getAccessToken()
    const clientId = process.env.QF_CLIENT_ID

    if (!clientId) {
        throw new Error('QF_CLIENT_ID environment variable is required')
    }

    const response = await fetch('https://apis-prelive.quran.foundation/content/api/v4/chapters', {
        method: 'GET',
        headers: {
            'x-auth-token': accessToken,
            'x-client-id': clientId,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            tokenCache = null
            throw new Error('UNAUTHORIZED')
        } else if (response.status >= 500) {
            throw new Error('BAD_GATEWAY')
        } else {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
    }

    return await response.json()
}
