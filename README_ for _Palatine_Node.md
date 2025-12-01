# n8n-nodes-palatine-transcriber

> **Status**: Stable ✅  
> Built for seamless integration of **Palatine Speech API** into your n8n workflows.

Palatine provides state-of-the-art speech-to-text (STT) services with support for multiple models, including fast and accurate `palatine_small` and high-precision `palatine_large_turbo`. Transcribe audio files (MP3, WAV, OGG, etc.) directly in n8n — no manual HTTP requests needed.

**n8n** is a powerful, open-source, AI-native workflow automation tool. Connect 400+ services and build complex, production-ready automations — visually or with code.

---

## ✨ Features

- **Audio Transcription** — Send any binary audio file (`mp3`, `wav`, `ogg`, etc.) and get high-quality text output.
- **Model Selection** — Choose between fast (`palatine_small`) and high-accuracy (`palatine_large_turbo`) models.
- **Multiple Output Formats** — Get results as plain `text`, structured `JSON`, or subtitles (`SRT`, `VTT`).
- **Native Binary Support** — Works directly with n8n binary data (e.g., from *Read Binary Files*, *Telegram*, *HTTP Request*).
- **Error Resilience** — Supports *Continue on Fail* for robust workflows.

---

## 📦 Installation

1. In your n8n instance, go to **Settings → Community Nodes → Install new**  
2. Enter:  n8n-nodes-palatine-transcriber
3. Click **Install**

> ⚠️ Make sure `N8N_COMMUNITY_NODES_ENABLED=true` is set.

---

## 🔑 Credentials

1. Go to **Credentials → + Create**  
2. Search for **Palatine Transcriber API**  
3. Fill in:
- **API Key** — your secret token from [api.palatine.ru](https://api.palatine.ru)
- **Base URL** — usually `https://api.palatine.ru` (default)

> 💡 You can find your API key in your Palatine dashboard.

---

## 🧪 Example Workflow

1. `Read Binary Files` → select `.mp3`  
2. `Palatine Transcriber`  
- Binary Property: `data`  
- Model: `palatine_large_turbo`  
- Response Format: `json`  
3. `Set` → extract `{{ $json.transcription }}`  
4. `Telegram` → send result to chat 🎉

---

## 🛠 Compatibility

- **n8n ≥ 1.39.1** (tested up to **1.119.1**)
- Node.js 18+ (recommended: 20–24)

---

## 📚 Resources

- [Palatine API Documentation](https://api.palatine.ru/docs)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)
- [Official n8n GitHub](https://github.com/n8n-io/n8n)

---

## 🏷️ Keywords

`n8n-community-node-package`, `n8n`, `palatine`, `speech-to-text`, `transcription`, `stt`, `audio`, `ai`, `automation`, `russian-asr`, `whisper-alternative`