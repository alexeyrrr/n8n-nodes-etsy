// EtsyOAuth2Api.credentials.ts
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class EtsyOAuth2Api implements ICredentialType {
	name = 'etsyOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Etsy OAuth2 API';
	documentationUrl = 'https://developer.etsy.com/documentation/essentials/authentication/';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID (Keystring)',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Used for refreshing tokens',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'address_r billing_r email_r favorites_r favorites_w feedback_r listings_d listings_r listings_w profile_r recommend_r shops_r shops_w transactions_r', //profile_w transactions_w recommend_w cart_r cart_w address_w
		},
		{
			displayName: 'Authorization URL',
			name: 'authorizationUrl',
			type: 'hidden',
			required: false,
			default: 'https://www.etsy.com/oauth/connect',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			required: false,
			default: 'https://api.etsy.com/v3/public/oauth/token',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
	];

	oauth2 = {
		authorizationUrl: 'https://www.etsy.com/oauth/connect',
		accessTokenUrl: 'https://api.etsy.com/v3/public/oauth/token',
		pkce: true,
		scopeSeparator: ' ',

		// Token Exchange Headers
		headers: {
			'x-api-key': '={{$credentials.clientId.trim() + ":" + $credentials.clientSecret.trim()}}',
			'Content-Type': 'application/x-www-form-urlencoded',
		},

		// Token Exchange Body
		body: {
			grant_type: 'authorization_code',
			client_id: '={{$credentials.clientId}}',
			redirect_uri: '={{$oauthCallbackUrl}}',
		},

		// ADDED: Replicates the TokenRefresher.ts from etsy-ts
		refreshAccessToken: {
			method: 'POST',
			url: 'https://api.etsy.com/v3/public/oauth/token',
			headers: {
				'x-api-key': '={{$credentials.clientId.trim() + ":" + $credentials.clientSecret.trim()}}',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				grant_type: 'refresh_token',
				client_id: '={{$credentials.clientId}}',
			},
		},
	} as any;

	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				// Injects the dual API key on all authenticated API calls
				'x-api-key': '={{ $credentials.clientId.trim() + ":" + $credentials.clientSecret.trim() }}',
			},
		},
	};
}