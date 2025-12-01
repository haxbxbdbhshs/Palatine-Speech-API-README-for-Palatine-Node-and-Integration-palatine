# Гайд по n8n

> Узнайте, как использовать Palatine API в своём n8n пайплайне.

Вот краткое руководство по интеграции Palatine API с n8n:

1. **Добавьте узел HTTP Request:**  
   Найдите и добавьте узел **HTTP Request** в ваш рабочий процесс n8n.

   ![Search for HTTP Request Node](https://mintlify.s3.us-west-1.amazonaws.com/nexara/images/n8n.jpg)

2. **Импортируйте команду cURL:**  
   Нажмите на опцию **"Import cURL"** в настройках узла HTTP Request. Вставьте следующую команду, **не забудьте заменить `YOUR_PALATINE_API_KEY` на ваш реальный API-ключ Palatine**:

   ```bash
   curl --request POST \
   --url https://api.palatine.ru/api/v1/audio/transcriptions \
   --header 'Authorization: Bearer YOUR_PALATINE_API_KEY' \
   --header 'Content-Type: multipart/form-data'
   ```

3. **Настройте параметры тела запроса (Body Parameters):**  
   * Прокрутите вниз до раздела **Body** в параметрах узла.  
   * Убедитесь, что **Body Content Type** установлен как `Form-Data`.  

   Теперь добавьте два **обязательных** параметра:

   ### ✅ Параметр `file` (аудиофайл)
   * Нажмите **"Add Parameter"**  
   * **Name**: `file`  
   * **Parameter Type**: `n8n Binary File`  
   * **Input Data Field Name**: `data`  
     *(Предполагается, что предыдущий узел — например, **Read Binary File** — передаёт файл в поле `data`. Измените, если у вас другое имя поля.)*

   ![Configure Body Parameters for File](https://mintlify.s3.us-west-1.amazonaws.com/nexara/images/binary.jpg)

   ### ✅ Параметр `model` (модель распознавания)
   * Нажмите **"Add Parameter"** ещё раз  
   * **Name**: `model`  
   * **Parameter Type**: `Form data`  
   * **Value**: выберите одну из доступных моделей:
     * `palatine_small` — быстрая и лёгкая модель, подходит для коротких записей и чистой речи  
     * `palatine_large_turbo` — высокоточная модель с поддержкой шумов, диалектов и сложных условий  
     *(Рекомендуем: `palatine_small` для большинства задач)*

   Пример заполнения:  
   ![Model selection example](https://mintlify.s3.us-west-1.amazonaws.com/nexara/images/other.jpg)

4. **Готово! (Можно добавить дополнительные параметры):**  
   Базовая настройка завершена — узел теперь отправляет файл на транскрипцию с указанной моделью.

   * Дополнительные опциональные параметры (добавляйте как `String` в Body):
     - `language`: `ru`, `en`, `auto` — указание языка ускоряет обработку  
     - `response_format`: `text`, `srt`, `json` — формат вывода  
     - `task`: `diarize` — включить диаризацию (разделение по спикерам)

   * Убедитесь, что перед узлом HTTP Request есть источник аудио:  
     — **Read Binary File**, **Download File**, **S3**, **Google Drive**, или любой узел, отдающий бинарные данные в `binary.data`.

   Подробнее о всех доступных параметрах API читайте в [документации API](/en/api-reference/endpoint/transcription).

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.nexara.ru/llms.txt