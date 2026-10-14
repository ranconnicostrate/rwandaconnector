/**
 * Social sign-in configuration.
 *
 * GOOGLE — works entirely in the browser. Create an OAuth 2.0 "Web application"
 * client in Google Cloud Console, add this site's origin under "Authorised
 * JavaScript origins", and paste the client ID below.
 *
 * LINKEDIN — LinkedIn requires a client secret to exchange the sign-in code,
 * which must never ship to the browser. Create an app with the "Sign In with
 * LinkedIn using OpenID Connect" product, add `<origin>/auth/linkedin/callback`
 * as a redirect URL, paste the client ID below, and point `tokenExchangeUrl`
 * at a small server endpoint that:
 *   1. receives POST { code, redirectUri }
 *   2. exchanges it at https://www.linkedin.com/oauth/v2/accessToken
 *   3. calls https://api.linkedin.com/v2/userinfo
 *   4. responds { sub, email, email_verified, name, picture }
 */
export const oauthConfig = {
  google: {
    clientId: ''
  },
  linkedin: {
    clientId: '',
    tokenExchangeUrl: ''
  }
};