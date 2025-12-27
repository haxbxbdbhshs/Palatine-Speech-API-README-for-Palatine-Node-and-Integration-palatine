![hat of ReadME](https://github.com/haxbxbdbhshs/Palatine-Speech-Node-n8n/blob/main/hat.png)

# n8n-nodes-palatine-speech


> Разработано для бесшовной интеграции **Palatine Speech API** в воркфлоу n8n.

[Полный список поддерживаемых файлов доступе по ссылке](https://docs.speech.palatine.ru/documentation/technical_information/supported_files)\
[Полный список поддерживаемых языков доступе по ссылке](https://docs.speech.palatine.ru/documentation/technical_information/supported_languages)\
Нода позволяет транскрибировать, проводить диаризацию, анализ тональности, суммаризацию аудиофайлов (MP3, WAV, OGG и др.) напрямую в n8n — без необходимости вручную настраивать HTTP-запросы.


---

##  Поддерживаемые задачи (Tasks)

Подробнее о каждой задаче можно узнать из документации Palatine Speech, кликнув на ее название\
Нода поддерживает 4 типа задач, выбираемых через параметр **Task**:

###  [Transcribe — транскрибация речи](https://docs.speech.palatine.ru/documentation/quick_start/transcription)

Функция распознавания речи (Speech-to-Text, STT)


###  [Diarize — диаризация речи](https://docs.speech.palatine.ru/api-reference/diarization/diarization-polling-api/diarize)

Разметка аудио по спикерам и таймкодам

###  [Sentiment Analysis — анализ тональности](https://docs.speech.palatine.ru/documentation/quick_start/sentiment_analyze#sozdanie-zadachi)

Определяет эмоциональную окраску текста в аудио

###  [Summarize — пересказ аудио](https://docs.speech.palatine.ru/documentation/quick_start/summarization)

Нода предоставляет **саммери аудиофайлов** в различных форматах

##  Дополнительные параметры Summarize

При выборе `Task = Summarize` становятся доступны дополнительные параметры:

### **Thinking**

Включает расширенный режим рассуждений модели

### **AI Task**

Определяет тип Суммаризации:

* `meeting_summary` - Автоматический пересказ совещания, интервью или звонка
* `user_prompt` - Пользователь сам задаёт инструкцию для пересказа или для получения необходимой информации из аудиофайла

## Выбор модели

В поле model можно выбрать две модели, через которые будут выполняться задачи:\
  `palatine_small` — быстрая\
  `palatine_large_highspeed` — высокоточная


##  Особенности

Для задач **Diarize, Sentiment, Summarize** осуществляется двухэтапная работа ноды.

Алгоритм работы:

1. Нода отправляет задачу в Palatine Speech API
2. Получает `task_id`
3. Выполняет **polling статуса**
4. Возвращает финальный результат после завершения обработки

Настройки polling:
Интервал: **2 секунды**\
Максимум попыток: **150** (≈ 2 минуты)



## Установка


1. В вашем экземпляре n8n перейдите в **Settings → Community Nodes → Install new**
2. Введите: `n8n-nodes-palatine-speech`
3. Нажмите **Install**


---


## Учётные данные (Credentials)


1. Перейдите в **Credentials → + Create**
2. Найдите **Palatine Speech API**
3. Заполните поля:
  * **API Key** — ваш токен из личного кабинета Palatine
  * **Base URL** — по умолчанию `https://api.palatine.ru` 
>  API-ключ можно найти в https://speech.palatine.ru/dashboard.


## Пример воркфлоу

1. `Schedule Trigger` → Запуск Wowkflow
2. `Config` → Задаем основные параметры
3. `Download mp3 file` → С помощью http request 
4. `Palatine Speech` → Транскрибация
5. `Telegram` → отправить результат в чат

![workflow example](https://github.com/haxbxbdbhshs/Palatine-Speech-Node-n8n/blob/main/example_workflow.png)

## Совместимость

n8n ≥ 1.39.1 + Node.js 18+ (рекомендуется: 20–24)

## Полезные ресурсы


* [Документация Palatine Speech](https://docs.speech.palatine.ru/documentation/quick_start/transcription)
* [Руководство по Community Nodes в n8n](https://docs.n8n.io/integrations/community-nodes/)
* [Официальный GitHub n8n](https://github.com/n8n-io/n8n)

## Ключевые слова
`n8n-community-node-package`, `n8n`, `palatine`, `speech-to-text`, `transcribation`, `stt`, `audio`, `ai`, `automation`, `voice-to-text`, `speech-recognition`, `audio-transcription`, `audio2text`, `audio-processing`

