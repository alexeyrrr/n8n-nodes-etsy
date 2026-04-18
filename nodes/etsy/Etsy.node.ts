import { INodeType, INodeTypeDescription, IExecuteFunctions, IDataObject } from 'n8n-workflow';
// ADDED: Import your wrapper
import { etsyApiRequest } from './EtsyApiRequest';

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
                    // CHANGED: Use the wrapper instead of raw httpRequest
                    responseData = await etsyApiRequest.call(this, 'GET', '/users/me');
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