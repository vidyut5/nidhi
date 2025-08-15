type TokenCache = {
  accessToken: string
  expiresAt: number
} | null

let tokenCache: TokenCache = null

export async function getOlaAccessToken(): Promise<string | null> {
  const tokenUrl = process.env.OLA_OAUTH_TOKEN_URL
  const clientId = process.env.OLA_OAUTH_CLIENT_ID
  const clientSecret = process.env.OLA_OAUTH_CLIENT_SECRET

  if (!tokenUrl || !clientId || !clientSecret) {
    return null
  }

  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 10_000) {
    return tokenCache.accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    // Do not cache tokens
    cache: 'no-store',
  })

  if (!resp.ok) {
    return null
  }

  const data = await resp.json().catch(() => ({})) as any
  const accessToken = data.access_token || data.token || null
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 300
  if (!accessToken) return null

  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  }
  return accessToken
}



