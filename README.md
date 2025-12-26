# n8n-nodes-palatine-transcriber


> Разработано для бесшовной интеграции **Palatine Speech API** в рабочие процессы n8n.


Нода позволяет транскрибировать аудиофайлы (MP3, WAV, OGG и др.) напрямую в n8n — без необходимости вручную настраивать HTTP-запросы.


---

##  Поддерживаемые задачи (Tasks)

Нода поддерживает 4 типа задач, выбираемых через параметр **Task**:

###  Transcribe — транскрибация речи
Преобразование аудио в текст
Поддержка моделей:
   `palatine_small` — быстрая\
   `palatine_large_turbo` — высокоточная

###  Diarize — диаризация речи

Разделение текста по спикерам и по таймкодам, когда они говорят

###  Sentiment Analysis — анализ тональности

Определение эмоциональной окраски речи \
Возвращает структурированный JSON с результатами анализа

###  Summarize — пересказ аудио

Нода поддерживает **пересказ аудиофайлов** через Palatine Speech API.

##  Дополнительные параметры Summarize

При выборе `Task = Summarize` становятся доступны дополнительные параметры:

### **Thinking**

Включает расширенный режим рассуждений модели

### **AI Task**

Определяет тип Пересказа:

* `meeting_summary` - Автоматический пересказ совещания, интервью или звонка
* `user_prompt` - Пользователь сам задаёт инструкцию для пересказа или для получения определенной информации из аудиофайла

##  Асинхронная обработка и polling

Для задач:

* Diarize
* Sentiment
* Summarize

Алгоритм работы:

1. Отправляет задачу в Palatine API
2. Получает `task_id`
3. Выполняет **polling статуса**
4. Возвращает финальный результат после завершения обработки

 Настройки polling:
* Интервал: **2 секунды**
* Максимум попыток: **150** (≈ 2 минуты)



## Установка


1. В вашем экземпляре n8n перейдите в **Settings → Community Nodes → Install new**
2. Введите: `n8n-nodes-palatine-speech`
3. Нажмите **Install**


---


## Учётные данные (Credentials)


1. Перейдите в **Credentials → + Create**
2. Найдите **Palatine Speech API**
3. Заполните поля:
  * **API Key** — ваш секретный токен из личного кабинета Palatine
  * **Base URL** — обычно `https://api.palatine.ru` (значение по умолчанию)
>  API-ключ можно найти в https://speech.palatine.ru/dashboard.


## Пример рабочего процесса


1. `Download mp3 file` → С помощью http request 
2. `Palatine Speech`
3. `Set` → извлечь `{{ $json.transcription }}`
4. `Telegram` → отправить результат в чат

![workflow example](https://github.com/haxbxbdbhshs/Palatine-Speech-Node-n8n/blob/main/example_workflow.jpg)


## Совместимость


* n8n ≥ 1.39.1 + Node.js 18+ (рекомендуется: 20–24)


## Полезные ресурсы


* [Документация Palatine API](https://docs.speech.palatine.ru/documentation/quick_start/transcription)
* [Руководство по Community Nodes в n8n](https://docs.n8n.io/integrations/community-nodes/)
* [Официальный GitHub n8n](https://github.com/n8n-io/n8n)

## Ключевые слова
`n8n-community-node-package`, `n8n`, `palatine`, `speech-to-text`, `transcribation`, `stt`, `audio`, `ai`, `automation`
