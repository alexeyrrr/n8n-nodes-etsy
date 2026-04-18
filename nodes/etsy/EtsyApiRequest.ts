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

    const options = {
        method,
        url: `https://api.etsy.com/v3/application${endpoint}`,

        // This delegates ALL authentication (Bearer Token AND the x-api-key)
        // to your EtsyOAuth2Api.credentials.ts file.
        authentication: 'etsyOAuth2Api',

        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },

        body,
        qs: query,
        json: true,
    };

    try {
        // n8n's httpRequest helper handles 401s by auto-refreshing the token
        // using the refreshAccessToken block defined in your credentials file.
        return await this.helpers.httpRequest.call(this, options);
    } catch (error) {
        throw new NodeOperationError(
            this.getNode(),
            `Etsy API Error: ${error.message}`,
            { description: 'Verify your Client ID and Shared Secret are correct in credentials.' }
        );
    }
}