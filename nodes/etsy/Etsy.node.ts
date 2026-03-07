// Etsy.node.ts
import { INodeType, INodeTypeDescription, IExecuteFunctions, IDataObject } from 'n8n-workflow';

export class Etsy implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Etsy',
        name: 'etsy',
        icon: 'file:etsy.svg',
        group: ['transform'],
        version: 1,
        description: 'Interact with Etsy API v3',
        defaults: { name: 'Etsy' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'etsyOAuth2Api',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'User', value: 'user' },
                ],
                default: 'user',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['user'] } },
                options: [
                    { name: 'Get Me', value: 'getMe', description: 'Get authenticated user details' },
                ],
                default: 'getMe',
            },
        ],
    };

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData: IDataObject[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);

                let responseData;

                if (resource === 'user' && operation === 'getMe') {
                    // IMPORTANT: Use 'this.helpers.httpRequest' with 'authenticate: true'
                    // This tells n8n to look at the 'authenticate' block in your EtsyOAuth2Api.credentials.ts
                    const options = {
                        method: 'GET' as const,
                        url: `https://api.etsy.com/v3/application/users/me`,
                        authentication: 'etsyOAuth2Api', // Name must match the credential name
                        json: true,
                    };

                    responseData = await this.helpers.httpRequest.call(this, options);
                }

                returnData.push(responseData as IDataObject);
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ error: error.message });
                    continue;
                }
                throw error;
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}