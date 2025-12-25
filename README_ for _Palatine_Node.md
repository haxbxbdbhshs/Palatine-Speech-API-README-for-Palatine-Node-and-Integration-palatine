# n8n-nodes-palatine-transcriber


> Разработано для бесшовной интеграции **Palatine Speech API** в рабочие процессы n8n.


Нода позволяет транскрибировать аудиофайлы (MP3, WAV, OGG и др.) напрямую в n8n — без необходимости вручную настраивать HTTP-запросы.


Palatine предоставляет сервис распознавания речи (Speech-to-Text, STT) с поддержкой нескольких моделей:
* `palatine_small` - быстрая модель
* `palatine_large_turbo` - высокоточная модель


---


##  Обновления и расширенные возможности

Начиная с последних версий, нода **Palatine ASR & AI** была значительно расширена и теперь поддерживает не только базовую транскрибацию, но и дополнительные AI-функции Palatine с единым интерфейсом.

---

##  Поддерживаемые задачи (Tasks)

Нода поддерживает **4 типа AI-задач**, выбираемых через параметр **Task**:

###  Transcribe — транскрибация речи

* Преобразование аудио в текст (Speech-to-Text)
* Поддержка моделей:

  * `palatine_small` — быстрая
  * `palatine_large_turbo` — высокоточная
* Возвращает:

  * чистый текст
  * JSON-структуру (если поддерживается API)

---

###  Diarize — диаризация речи

* Автоматическое определение **нескольких говорящих**
* Разделение текста по спикерам
* Подходит для:

  * интервью
  * встреч
  * подкастов
* Использует **тот же параметр Model**, что и транскрибация

---

###  Sentiment Analysis — анализ тональности

* Определение эмоциональной окраски речи
* Подходит для:

  * колл-центров
  * отзывов
  * пользовательских разговоров
* Возвращает структурированный JSON с результатами анализа
* Поддерживает выбор модели (`palatine_small`, `palatine_large_turbo`)

---

###  Summarize — пересказ аудио

Нода поддерживает **интеллектуальный пересказ аудиофайлов** через Palatine AI Service.

##  Дополнительные параметры Summarize

При выборе `Task = Summarize` становятся доступны дополнительные параметры:
### **Prompt**

* Произвольная текстовая инструкция для AI
* **Обязателен**, если выбран `User Prompt`
* **Опционален**, но поддерживается и для `Meeting Summary`

---

### **Thinking**

* Boolean-параметр
* Включает расширенный режим рассуждений модели (если поддерживается API)
* Полезен для:

  * сложных инструкций
  * аналитических summary

---


### **AI Task**

Определяет тип Пересказа:

* `meeting_summary`
* `user_prompt` 

---


### Описание параметров:


#####  Meeting Summary

* Автоматический пересказ
* Подходит для:

  * совещаний
  * интервью
  * звонков
* Может использовать **дополнительный prompt** для уточнения структуры пересказа

#####  User Prompt

* Пользователь сам задаёт инструкцию для AI
* Примеры:

  * «Сделай краткий конспект»
  * «Выдели ключевые решения»


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
* Максимум попыток: **60** (≈ 2 минуты)

---


##  Формат выходных данных

Выходной JSON всегда содержит:

```json
{
  "task": "summarize",
  "source_file": "example.mp3",
  "model_used": "palatine_small"
}
```

Дополнительно, в зависимости от задачи:

* `transcription`
* `diarization`
* `sentiment`
* `summary`

---


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


---


## Пример рабочего процесса


1. `Download mp3 file` → С помощью http request 
2. `Palatine Speech`


  * Binary Property: `data`
  * Task: `Transcribe`
  * Model: `palatine_large_turbo`
3. `Set` → извлечь `{{ $json.transcription }}`
4. `Telegram` → отправить результат в чат

![workflow example](https://github.com/haxbxbdbhshs/Palatine-Speech-Node-n8n/blob/main/example_workflow.jpg)
---


## Совместимость


* **n8n ≥ 1.39.1**
* Node.js 18+ (рекомендуется: 20–24)


---


## Полезные ресурсы


* [Документация Palatine API](https://docs.speech.palatine.ru/documentation/quick_start/transcription)
* [Руководство по Community Nodes в n8n](https://docs.n8n.io/integrations/community-nodes/)
* [Официальный GitHub n8n](https://github.com/n8n-io/n8n)


---


## Ключевые слова




`n8n-community-node-package`, `n8n`, `palatine`, `speech-to-text`, `transcribation`, `stt`, `audio`, `ai`, `automation`













