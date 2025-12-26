import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import FormData from 'form-data';

export class PalatineNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Palatine Speech',
		name: 'palatineNode',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		description: 'Transcribe, diarize, analyze sentiment or summarize audio using Palatine API',
		defaults: {
			name: 'Palatine Speech',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'palatineNodeApi', required: true }],
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
				description: 'Model (applies to all tasks)',
			},

			// ————— Summarize-only parameters —————
			{
				displayName: 'AI Task',
				name: 'summarizeTask',
				type: 'options',
				options: [
					{ name: 'Meeting Summary', value: 'meeting_summary' },
					{ name: 'User Prompt', value: 'user_prompt' },
				],
				default: 'user_prompt',
				description: 'Summarization task (sent as query parameter)',
				displayOptions: {
					show: {
						task: ['summarize'],
					},
				},
			},
			{
				displayName: 'Prompt',
				name: 'summarizePrompt',
				type: 'string',
				default: '',
				description: 'Used only when AI Task = "User Prompt". If empty, "*" will be sent as fallback.',
				displayOptions: {
					show: {
						task: ['summarize'],
						summarizeTask: ['user_prompt'],
					},
				},
			},
			{
				displayName: 'Thinking',
				name: 'summarizeThinking',
				type: 'boolean',
				default: false,
				description: 'Thinking mode (sent as query parameter)',
				displayOptions: {
					show: {
						task: ['summarize'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const pollIntervalMs = 2000;
		const maxPollAttempts = 150;

		const extractTaskId = (resp: any): string | undefined => {
			if (!resp) return undefined;
			if (typeof resp === 'string') return undefined;
			return resp.task_id || resp.taskId || resp.id || resp.task?.id;
		};

		const normalizeStatus = (s: any): string => {
			if (typeof s !== 'string') return '';
			return s.trim().toLowerCase();
		};

		const isTerminalSuccess = (statusPayload: any): boolean => {
			const s =
				normalizeStatus(statusPayload?.status) ||
				normalizeStatus(statusPayload?.state) ||
				normalizeStatus(statusPayload?.task_status);

			if (['completed', 'done', 'success', 'finished'].includes(s)) return true;

			const hasResult =
				statusPayload?.result !== undefined ||
				statusPayload?.data !== undefined ||
				statusPayload?.output !== undefined ||
				statusPayload?.response !== undefined;

			const looksProcessing = ['queued', 'pending', 'processing', 'running', 'in_progress'].includes(s);

			return hasResult && !looksProcessing;
		};

		const isTerminalFailure = (statusPayload: any): boolean => {
			const s =
				normalizeStatus(statusPayload?.status) ||
				normalizeStatus(statusPayload?.state) ||
				normalizeStatus(statusPayload?.task_status);

			return ['failed', 'error', 'canceled', 'cancelled'].includes(s);
		};

		const unwrapFinalPayload = (statusPayload: any): any => {
			return (
				statusPayload?.result ??
				statusPayload?.data ??
				statusPayload?.output ??
				statusPayload?.response ??
				statusPayload
			);
		};

		const buildUrlWithQuery = (
			base: string,
			query: Record<string, string | boolean | undefined>,
		): string => {
			const params = new URLSearchParams();
			for (const [k, v] of Object.entries(query)) {
				if (v === undefined) continue;
				params.set(k, typeof v === 'boolean' ? String(v) : String(v));
			}
			const qs = params.toString();
			return qs ? `${base}?${qs}` : base;
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
				const task = this.getNodeParameter('task', i) as string;
				const model = this.getNodeParameter('model', i) as string;

				let summarizeTask: string | undefined;
				let summarizeThinking = false;
				let summarizePromptRaw = '';

				if (task === 'summarize') {
					summarizeTask = this.getNodeParameter('summarizeTask', i) as string;
					summarizeThinking = this.getNodeParameter('summarizeThinking', i) as boolean;

					// safe read: summarizePrompt exists only when summarizeTask=user_prompt
					if (summarizeTask === 'user_prompt') {
						summarizePromptRaw = this.getNodeParameter('summarizePrompt', i, { fallbackValue: '' }) as string;
					} else {
						summarizePromptRaw = '';
					}
				}

				const binaryData = items[i].binary?.[binaryProperty];
				if (!binaryData) {
					throw new Error(`No binary data in property "${binaryProperty}"`);
				}

				// ✅ Credentials (tied to PalatineNodeApi.credentials.ts)
				const credentials = await this.getCredentials('palatineNodeApi');
				const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
				const apiKey = credentials.apiKey as string;

				const audioBuffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

				let url: string;
				let form: FormData;
				let response: any;

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
						form.append('model', model);
						url = `${baseUrl}/api/v1/diarization/do_diarize`;
						break;

					case 'sentiment':
						form = new FormData();
						form.append('file', audioBuffer, {
							filename: binaryData.fileName || 'audio',
							contentType: binaryData.mimeType || 'audio/mpeg',
						});
						form.append('model', model);
						url = `${baseUrl}/api/v1/sentiment_analysis/analyze_file`;
						break;

					case 'summarize': {
						if (!summarizeTask) {
							throw new Error('Summarize: summarizeTask is missing');
						}

						form = new FormData();
						form.append('file', audioBuffer, {
							filename: binaryData.fileName || 'audio',
							contentType: binaryData.mimeType || 'audio/mpeg',
						});
						form.append('model', model);

						// Smart prompt logic:
						// - meeting_summary → always "*"
						// - user_prompt → user input OR "*" if empty
						const promptToSend =
							summarizeTask === 'meeting_summary'
								? '*'
								: (summarizePromptRaw || '').trim() || '*';

						const base = `${baseUrl}/api/v1/ai_service/summarize_file`;
						url = buildUrlWithQuery(base, {
							task: summarizeTask,
							prompt: promptToSend,
							thinking: summarizeThinking,
						});
						break;
					}

					default:
						throw new Error(`Unknown task: ${task}`);
				}

				response = await this.helpers.httpRequest({
					method: 'POST',
					url,
					headers: {
						...form.getHeaders(),
						Authorization: `Bearer ${apiKey}`,
					},
					body: form,
					json: true,
				});

				// 🔁 Poll for async tasks (non-transcribe)
				if (task !== 'transcribe') {
					const taskId = extractTaskId(response);

					if (taskId) {
						const statusUrl = `${baseUrl}/api/v1/transcribe/task_status/${taskId}`;

						let statusPayload: any = null;
						for (let attempt = 1; attempt <= maxPollAttempts; attempt++) {
							statusPayload = await this.helpers.httpRequest({
								method: 'GET',
								url: statusUrl,
								headers: {
									Authorization: `Bearer ${apiKey}`,
								},
								json: true,
							});

							if (isTerminalFailure(statusPayload)) {
								throw new Error(
									`Task ${taskId} failed: ${
										statusPayload?.error || statusPayload?.message || JSON.stringify(statusPayload)
									}`,
								);
							}

							if (isTerminalSuccess(statusPayload)) {
								response = unwrapFinalPayload(statusPayload);
								break;
							}

							await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
						}

						if (!isTerminalSuccess({ result: response, status: response?.status, state: response?.state })) {
							throw new Error(
								`Task ${taskId} did not complete within polling limit (${maxPollAttempts} attempts)`,
							);
						}
					}
				}

				// 📤 Output
				const result: Record<string, any> = {
					task,
					source_file: binaryData.fileName,
					model_used: model,
				};

				if (task === 'transcribe') {
					result.transcription =
						typeof response === 'string'
							? response.trim()
							: (response?.text || response?.transcription || '');
				} else if (task === 'diarize') {
					result.diarization = response;
				} else if (task === 'sentiment') {
					result.sentiment = response;
				} else if (task === 'summarize') {
					result.summary =
						typeof response === 'string'
							? response
							: (response?.summary || response?.result || response?.text || response);
				}

				returnData.push({
					json: result,
					binary: items[i].binary,
				});
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (this.continueOnFail()) {
					returnData.push({ json: { error: errorMessage } });
				} else {
					throw new Error(`[Palatine] ${errorMessage}`);
				}
			}
		}

		return [returnData];
	}
}
