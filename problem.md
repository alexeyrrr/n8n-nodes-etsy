
Here is a comprehensive summary of the research regarding n8n custom credentials and the specific requirements for the [Etsy Open API v3](https://developer.etsy.com/documentation/essentials/authentication). You can copy and paste this text into a file.

---

# RESEARCH SUMMARY: n8n Custom Credentials for Etsy API v3

## 1. The Core Problem

Standard n8n OAuth2 credentials fail with Etsy because Etsy requires a "Non-Standard" dual-authentication approach. Every request must contain:

- **Header 1:** `Authorization: Bearer [ACCESS_TOKEN]`
- **Header 2:** `x-api-key: [CLIENT_ID]`
Additionally, the token exchange process requires specific handling of PKCE and body-based parameters that n8n's default engine often struggles to automate without custom code.

## 2. Findings on n8n Custom Credentials

- **Persistence:** Custom credentials must be stored in the `/home/node/.n8n/custom/` directory inside the container. To prevent data loss during updates, this must be mapped to a **Docker Volume** on the host machine.
- **File Format:** n8n requires compiled JavaScript (`.js`) files and a `package.json` in the custom folder. It cannot read raw TypeScript (`.ts`) files directly.
- **Extension Logic:** By using `extends: ['oAuth2Api']` in a custom credential, you can inherit n8n's OAuth handling while using the `authenticate` block to "force-inject" the mandatory `x-api-key` header.

## 3. Etsy-Specific OAuth2 Requirements

Based on the [Etsy Authentication Documentation](https://developer.etsy.com/documentation/essentials/authentication):

- **PKCE (Mandatory):** Requires `code_challenge` and `code_challenge_method=S256`.
- **Token Exchange:** The `POST` to `/oauth/token` must have `client_id` in the **body** (application/x-www-form-urlencoded), not in a Basic Auth header.
- **Scopes:** Etsy is highly sensitive to scopes. If an app requests a scope it isn't approved for in the Etsy Dashboard (e.g., `address_r`), the entire flow will error out.
- **Token Format:** The `access_token` returned by Etsy includes a `user_id` prefix (e.g., `12345.abc...`). The full string provided by the API must be used as the Bearer token.

## 4. Implementation Strategy

Due to a known limitation in n8n where it occasionally forces `client_secret` into a header instead of the body, the most stable path is:

1. **Custom Credential File:** Create a file that defines the Etsy OAuth2 endpoints but explicitly adds the `x-api-key` to the `authenticate` header properties.
2. **Manual Exchange (If Needed):** If n8n's automated "Connect" button fails the token exchange, use an **HTTP Request Node** to manually perform the `POST` to Etsy's token endpoint with the `code_verifier` and `client_id` in the body.
3. **Persistence Check:** Ensure your Docker setup includes a bind mount for the `.n8n` directory to ensure these custom files and your tokens survive container restarts.

## 5. Required Headers for API Calls

Once authenticated, all calls to `https://openapi.etsy.com/v3/application/...` must include:

- `x-api-key`: `[Your Keystring]`
- `Authorization`: `Bearer [Full Token string]`