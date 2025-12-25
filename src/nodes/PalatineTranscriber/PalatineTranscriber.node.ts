import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import FormData from 'form-data';

export class PalatineTranscriber implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Palatine ASR & AI',
    name: 'palatineTranscriber',
    icon: 'file:palatineTranscriber.svg',
    group: ['transform'],
    version: 1,
    description: 'Transcribe, diarize, analyze sentiment or summarize audio using Palatine API',
    defaults: {
      name: 'Palatine ASR',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'palatineTranscriberApi', required: true }],
    properties: [
      {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        default: 'data',
        description: 'Name of the binary property that contains the audio file',
      },
      {
        displayName: 'Task',
        name: 'task',
        type: 'options',
        options: [
          { name: 'Transcribe', value: 'transcribe' },
          { name: 'Diarize', value: 'diarize' },
          { name: 'Sentiment Analysis', value: 'sentiment' },
          { name: 'Summarize', value: 'summarize' },
        ],
        default: 'transcribe',
        description: 'Choose: transcribe, diarize, analyze sentiment or summarize',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'palatine_small', value: 'palatine_small' },
          { name: 'palatine_large_turbo', value: 'palatine_large_turbo' },
        ],
        default: 'palatine_small',
        description: 'Model (used only for transcription)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // --- 1. Получаем параметры ---
        const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
        const task = this.getNodeParameter('task', i) as string;
        const model = this.getNodeParameter('model', i) as string;

        // --- 2. Получаем бинарные данные ---
        const binaryData = items[i].binary?.[binaryProperty];
        if (!binaryData) {
          throw new Error(`No binary data in property "${binaryProperty}"`);
        }

        // --- 3. Получаем credentials ---
        const credentials = await this.getCredentials('palatineTranscriberApi');
        const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
        const apiKey = credentials.apiKey as string;

        // --- 4. Читаем аудио как Buffer ---
        const audioBuffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

        let url: string;
        let form: FormData;
        let response: any;

        // --- 5. Формируем запрос в зависимости от задачи ---
        switch (task) {
          case 'transcribe':
            form = new FormData();
            form.append('file', audioBuffer, {
              filename: binaryData.fileName || 'audio',
              contentType: binaryData.mimeType || 'audio/mpeg',
            });
            form.append('model', model);
            url = `${baseUrl}/api/v1/audio/transcriptions`;
            break;

          case 'diarize':
            form = new FormData();
            form.append('file', audioBuffer, {
              filename: binaryData.fileName || 'audio',
              contentType: binaryData.mimeType || 'audio/mpeg',
            });
            url = `${baseUrl}/api/v1/diarization/do_diarize`;
            break;

          case 'sentiment':
            form = new FormData();
            form.append('file', audioBuffer, {
              filename: binaryData.fileName || 'audio',
              contentType: binaryData.mimeType || 'audio/mpeg',
            });
            url = `${baseUrl}/api/v1/sentiment_analysis/analyze_file`;
            break;

          case 'summarize':
            form = new FormData();
            form.append('file', audioBuffer, {
              filename: binaryData.fileName || 'audio',
              contentType: binaryData.mimeType || 'audio/mpeg',
            });
            url = `${baseUrl}/api/v1/ai_service/summarize_file`;
            break;

          default:
            throw new Error(`Unknown task: ${task}`);
        }

        // --- 6. Отправляем запрос ---
        response = await this.helpers.httpRequest({
          method: 'POST',
          url,
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${apiKey}`,
          },
          body: form,
        });

        // --- 7. Формируем результат ---
        const result: Record<string, any> = {
          task,
          source_file: binaryData.fileName,
        };

        if (task === 'transcribe') {
          let transcription = '';
          if (typeof response === 'string') {
            transcription = response.trim();
          } else if (response && typeof response === 'object') {
            transcription = response.text || response.transcription || '';
          }
          result.transcription = transcription;
          result.model_used = model;
        } else if (task === 'diarize') {
          result.diarization = response;
        } else if (task === 'sentiment') {
          result.sentiment = response;
        } else if (task === 'summarize') {
          result.summary = typeof response === 'string' ? response : response.summary || response.result || '';
        }

        returnData.push({
          json: result,
          binary: items[i].binary,
        });

      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);

        if (this.continueOnFail()) {
          returnData.push({ json: { error: errorMessage } });
          continue;
        }

        throw new Error(`[Palatine] ${errorMessage}`);
      }
    }

    return [returnData];
  }
}