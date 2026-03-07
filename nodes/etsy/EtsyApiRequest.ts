import {
    IExecuteFunctions,
    IHttpRequestMethods,
    IDataObject,
    NodeOperationError
} from 'n8n-workflow';

export async function etsyApiRequest(
    this: IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    query: IDataObject = {},
): Promise<any> {
    const credentials = await this.getCredentials('etsyOAuth2Api');

    if (!credentials) {
        throw new NodeOperationError(this.getNode(), 'No credentials found!');
    }

    /**
     * AS PER ETSY 2026 REQUIREMENTS:
     * The x-api-key must be 'keystring:shared_secret'
     */
    const key = `${credentials.clientId}:${credentials.clientSecret}`;

    const options = {
        method,
        url: `https://api.etsy.com/v3/application${endpoint}`,

        // This triggers the automatic Bearer Token injection from n8n
        authentication: 'etsyOAuth2Api',

        headers: {
            'x-api-key': key,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },

        body,
        qs: query,
        json: true,
    };

    try {
        // n8n's httpRequest helper handles 401s by auto-refreshing the token
        return await this.helpers.httpRequest.call(this, options);
    } catch (error) {
        throw new NodeOperationError(
            this.getNode(),
            `Etsy API Error: ${error.message}`,
            { description: 'Verify your Client ID and Shared Secret are correct in credentials.' }
        );
    }
}