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
		{ //leave in so we can hide
			displayName: 'Authorization URL',
			name: 'authorizationUrl',
			type: 'hidden',
			required: false,
			default: 'https://www.etsy.com/oauth/connect',
		},
		{ //leave in so we can hide
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			required: false,
			default: 'https://api.etsy.com/v3/public/oauth/token',
		},
		{ //leave in so we can hide
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{ //leave in so we can hide
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
	];

	oauth2 = {
		authorizeUrl: 'https://www.etsy.com/oauth/connect',
		tokenUrl: 'https://api.etsy.com/v3/public/oauth/token',
		pkce: 'S256', // Matches "code_challenge_method=S256" in Step 1

		headers: {
			'x-api-key': '={{ `${$credentials.clientId.trim()}:${$credentials.clientSecret.trim()}` }}',
			//'x-api-key': '={{$credentials.clientId.trim() + ":" + $credentials.clientSecret.trim()}}',
			'Content-Type': 'application/x-www-form-urlencoded',
		},

		// Strictly matching the Step 3 table (POST body)
		body: {
			grant_type: 'authorization_code',
			//client_id: '={{$credentials.clientId}}',
			redirect_uri: '={{$oauthCallbackUrl}}',
			'Accept': 'application/x-www-form-urlencoded',
		},

		// Strictly matching the Refresh Token section
		refreshAccessToken: {
			method: 'POST',
			url: 'https://api.etsy.com/v3/public/oauth/token',
			headers: {
				'x-api-key': '={{ `${$credentials.clientId.trim()}:${$credentials.clientSecret.trim()}` }}',
				//'x-api-key': '={{ $credentials.clientId + ":" + $credentials.clientSecret }}',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				grant_type: 'refresh_token',
				//client_id: '={{$credentials.clientId}}',
				refresh_token: '={{$oauth2.refreshToken}}',
			},
		},
	} as any;

	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				// The "keystring" must be sent as x-api-key for all resource calls
				'x-api-key': '={{ `${$credentials.clientId.trim()}:${$credentials.clientSecret.trim()}` }}',
				//'x-api-key': '={{ $credentials.clientId + ":" + $credentials.clientSecret }}',
				'Authorization': '={{"Bearer " + $oauth2.accessToken}}',
				'Accept': 'application/json'
			},
		},
	};
}





