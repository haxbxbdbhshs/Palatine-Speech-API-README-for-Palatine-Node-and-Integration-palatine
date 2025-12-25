import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PalatineTranscriberApi implements ICredentialType {
  name = 'palatineTranscriberApi';
  displayName = 'Palatine Transcriber API';
  documentationUrl = 'https://api.palatine.ru/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Palatine API key',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.palatine.ru',
      description: 'Base URL of the API (usually https://api.palatine.ru)',
    },
  ];
}