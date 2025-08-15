import { PKCEParams } from '../types/auth';

/**
 * Generate a cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate base64url encoded string from buffer
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCEParams(): Promise<PKCEParams> {
  // Generate code verifier (43-128 characters)
  const codeVerifier = generateRandomString(32); // 64 characters in hex
  
  // Generate code challenge using SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(digest);
  
  // Generate state parameter for CSRF protection
  const state = generateRandomString(16); // 32 characters in hex
  
  return {
    codeVerifier,
    codeChallenge,
    state
  };
}

/**
 * Build GitHub OAuth authorization URL
 */
export function buildAuthUrl(clientId: string, redirectUri: string, codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo workflow user:email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    response_type: 'code'
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token using PKCE
 */
export async function exchangeCodeForToken(
  code: string, 
  codeVerifier: string, 
  clientId: string, 
  redirectUri: string
): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Fetch user data from GitHub API
 */
export async function fetchGitHubUser(token: string): Promise<any> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
  }

  return response.json();
}