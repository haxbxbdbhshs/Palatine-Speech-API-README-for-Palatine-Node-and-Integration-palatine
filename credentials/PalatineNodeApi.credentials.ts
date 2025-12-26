import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PalatineNodeApi implements ICredentialType {
  name = 'palatineNodeApi'; // ← должно совпадать с credentials.name в описании ноды
  displayName = 'Palatine API';
  documentationUrl = 'https://your-palatine-docs.com'; // ← замените
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.palatine.example.com',
      required: true,
      placeholder: 'https://api.palatine.example.com',
      description: 'The base URL of the Palatine API (without trailing slash)',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Palatine API key',
    },
  ];
}