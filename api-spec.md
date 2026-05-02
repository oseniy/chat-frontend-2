openapi: 3.0.3
info:
title: А-чат API
version: 1.0.0
description: |-
Протокол обмена по проекту А-чат.

    **Авторизация:**
    1. **REST API**: Используйте окно "Authorize" (префикс Bearer добавится автоматически).
    2. **WebSocket**: Токен передается в заголовке `Authorization: Token <token>` или через query-параметр `?authorization=<token>`.

paths:
/api/v1/auth/login/refresh/token/:
post:
operationId: auth*login_refresh_token_create
description: Делегирует обновление токенов стандартному SimpleJWT view.
summary: Обновить пару токенов по refresh - токену
tags: - auth
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/TokenRefresh'
required: true
security: - jwtAuth: [] - {}
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/TokenRefresh'
description: ''
/api/v1/auth/messenger/login/get/code/:
post:
operationId: auth_messenger_login_get_code_create
description: " **Отправить код на номер телефона для мессенджера** \n\nРазрешено
запросить код для авторизации не более 10 за 1 час."
summary: Отправить код на номер телефона для мессенджера (ОТКЛЮЧЕНО)
tags: - auth SMSAERO
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerCreateCodePhone'
examples:
ЗапросПроверочногоКода:
value:
phone_number: '+79876543210'
summary: Запрос проверочного кода
required: true
security: - jwtAuth: [] - {}
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerCreateCodePhone'
examples:
КодУспешноОтправлен:
value:
phone_number: '+79876543210'
summary: Код успешно отправлен
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/ValidationError'
examples:
НеверныйФорматНомера:
value:
phone_number: - некорректный формат номера телефона, формат должен соответствовать
стандарту E164 - +1234567890, где N (0..9)
summary: Неверный формат номера
description: Ошибка валидации запроса
'403':
content:
application/json:
schema:
$ref: '#/components/schemas/MessageResponse'
examples:
ПревышенЛимитЗапросов(10ВЧас):
value:
message: Количество запросов превышено, повторите попытку через
1 час.
summary: Превышен лимит запросов (10 в час)
SMSAeroFlowОтключен:
value:
message: Авторизация через SMS Aero отключена.
summary: SMS Aero flow отключен
description: Ошибка доступа
/api/v1/auth/messenger/login/get/token/:
post:
operationId: auth_messenger_login_get_token_create
description: " **Получение пару токенов по коду для мессенджера** \n\nПосле
первых пяти неудачных попыток ввести код, пользователь блокируется на 10 мин.\n\nПосле
вторых 5 и последующих попыток - блокируется на 1 час."
summary: Получение пару токенов по коду для мессенджера (ОТКЛЮЧЕНО)
tags: - auth SMSAERO
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerGetFromCodeToken'
examples:
ЗапросТокеновПоКоду:
value:
phone_number: '+79876543210'
code: '11111'
summary: Запрос токенов по коду
required: true
security: - jwtAuth: [] - {}
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerGetFromCodeToken'
examples:
ТокеныУспешноПолучены:
value:
refresh: 'eyJ0e... '
access: eyJ0e...
is_filled: true
summary: Токены успешно получены
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/ValidationError'
examples:
НеверныйПроверочныйКод:
value:
code: - Код не верен. Запросите новый код.
summary: Неверный проверочный код
description: Ошибка валидации запроса
'403':
content:
application/json:
schema:
$ref: '#/components/schemas/MessageResponse'
examples:
МногоПопыток(блокировкаНа10Мин):
value:
message: Превышено количество попыток. Блокировка на 10 минут.
summary: Много попыток (блокировка на 10 мин)
МногоПопыток(блокировкаНа1Час):
value:
message: Превышено количество попыток. Блокировка на 1 час.
summary: Много попыток (блокировка на 1 час)
SMSAeroFlowОтключен:
value:
message: Авторизация через SMS Aero отключена.
summary: SMS Aero flow отключен
description: Ошибка доступа
/api/v1/auth/messenger/profile/:
post:
operationId: auth_messenger_profile_create
description: "\n Редактирование/получение текущего профиля пользователя
для мессенджера\n (с авторизацией)\n\n Для получения текущего
профиля требуется передать пустой объект: {}\n "
summary: Редактирование/получение текущего профиля пользователя для мессенджера
(с авторизацией)
tags: - auth
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerProfileUser'
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerProfileUser'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
field_name:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'409':
content:
application/json:
schema:
type: object
properties:
detail:
description: Сообщение об ошибке
type: string
example: Аккаунт уже удален
description: ''
delete:
operationId: auth_messenger_profile_destroy
description: "\n Мягкое удаление аккаунта пользователя мессенджера.\n\n
\ **Важные особенности:**\n - Все сообщения пользователя сохраняются
в чатах\n - Другие пользователи увидят \"Удалённый пользователь\" вместо
имени\n - Аккаунт можно восстановить только через админку\n -
Все JWT токены пользователя инвалидируются\n - Пользователь немедленно
отключается от WebSocket каналов\n - Через 30 дней данные пользователя
анонимизируются\n "
summary: Удаление аккаунта пользователя мессенджера
tags: - auth
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
type: object
properties:
messages:
description: Удаление аккаунта
type: string
example: Аккаунт успешно удалён
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'409':
content:
application/json:
schema:
type: object
properties:
detail:
description: Сообщение об ошибке
type: string
example: Аккаунт уже удален
description: ''
/api/v1/auth/messenger/profile/avatar/:
post:
operationId: auth_messenger_profile_avatar_create
description: "\n Использовать формат multipart/form-data\n "
summary: Загрузка аватара пользователя (с авторизацией).
tags: - auth
requestBody:
content:
multipart/form-data:
schema:
type: object
properties:
file:
type: string
format: binary
description: Аватар пользователя
required: true
in: body
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/MessengerAvatarModel'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/ValidationError'
examples:
ФайлНеПередан:
value:
file: - Это поле обязательно.
summary: Файл не передан
description: Ошибка валидации при загрузке аватара
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
delete:
operationId: auth_messenger_profile_avatar_destroy
description: Удаляет аватар текущего авторизованного пользователя из БД и связанные
файлы с диска.
summary: Удаление аватара текущего пользователя
tags: - auth
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/MessageResponse'
examples:
УспешноеУдалениеАватара:
value:
message: Аватар успешно удалён
summary: Успешное удаление аватара
description: Аватар успешно удалён
'401':
content:
application/json:
schema:
$ref: '#/components/schemas/DetailResponse'
examples:
ОшибкаАвторизации:
value:
detail: Учетные данные не были предоставлены.
summary: Ошибка авторизации
description: Необходима авторизация
/api/v1/auth/messenger/profile/unique_nickname_check/{nickname}/:
get:
operationId: auth_messenger_profile_unique_nickname_check_retrieve
description: "\n Для валидации используется ^[a-zA-Z0-9.*]+$\n "
summary: Проверка уникальности nickname
parameters: - in: path
name: nickname
schema:
type: string
required: true
tags: - auth
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
type: object
properties:
messages:
description: Сообщение
type: string
example: Этот nickname свободен
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
field_name:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'409':
content:
application/json:
schema:
type: object
properties:
messages:
description: Сообщение об ошибке
type: string
example: Пользователь с таким ником уже существует.
description: ''
'414':
content:
application/json:
schema:
type: object
properties:
message:
description: Сообщение об ошибке
type: string
example: Размер query-параметра превышает установленный лимит.
description: ''
/api/v1/auth/providers/plusofon/flash-call/claim/{session_uid}/:
post:
operationId: auth_providers_plusofon_flash_call_claim_create
description: |-
Выдает JWT только после того, как auth-session подтверждена webhook-ом Plusofon.

        Этот endpoint вызывается после `start` и после успешного polling `status`, когда сессия уже перешла в `verified`.

        Pending-сессия живет 2 минуты, а verified-сессия живет 15 минут с момента подтверждения.
      summary: Выдать JWT по verified auth-session Plusofon
      parameters:
      - in: path
        name: session_uid
        schema:
          type: string
          format: uuid
        required: true
      tags:
      - auth PLUSOFON
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PlusofonPhoneAuthSessionSecret'
            examples:
              ClaimJWTПоAuth-session:
                value:
                  session_secret: secret-session-token
                summary: Claim JWT по auth-session
        required: true
      security:
      - jwtAuth: []
      - {}
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PlusofonPhoneAuthClaimResponse'
              examples:
                JWTУспешноВыданы:
                  value:
                    refresh: 'eyJ0e... '
                    access: eyJ0e...
                    is_filled: true
                  summary: JWT успешно выданы
          description: JWT успешно выданы
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
          description: Session secret не прошел проверку
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
          description: Auth-session не найдена
        '409':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                Auth-sessionЕщеНеПодтверждена:
                  value:
                    message: Auth-сессия еще не подтверждена.
                  summary: Auth-session еще не подтверждена
                Auth-sessionУжеИспользована:
                  value:
                    message: Auth-сессия уже использована.
                  summary: Auth-session уже использована
          description: Auth-session не готова к claim или уже использована
        '410':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                Auth-sessionИстекла:
                  value:
                    message: Auth-сессия истекла.
                  summary: Auth-session истекла
          description: Auth-session уже истекла

/api/v1/auth/providers/plusofon/flash-call/start/:
post:
operationId: auth_providers_plusofon_flash_call_start_create
description: |-
Создает auth-session для Plusofon Reverse Flash Call и возвращает номер, на который нужно выполнить обратный звонок.

        Если по номеру уже есть активная auth-session в статусе `pending`, endpoint повторно вернет ее данные без нового звонка.

        Если по номеру уже есть активная auth-session в статусе `verified`, endpoint вернет `409` без данных существующей сессии.

        Описание полей ответа: `PlusofonPhoneAuthStartResponse`
      summary: Стартовать авторизацию через Plusofon Reverse Flash Call
      tags:
      - auth PLUSOFON
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PlusofonPhoneAuthStartRequest'
            examples:
              СтартPlusofonAuth-session:
                value:
                  phone_number: '+79876543210'
                summary: Старт Plusofon auth-session
        required: true
      security:
      - jwtAuth: []
      - {}
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PlusofonPhoneAuthStartResponse'
              examples:
                Auth-sessionУспешноСоздана:
                  value:
                    session_uid: 550e8400-e29b-41d4-a716-446655440000
                    session_secret: secret-session-token
                    call_number: '+78001234567'
                    expires_at: '2026-03-24T12:00:00Z'
                    poll_interval_seconds: 2
                    attempt_number: 1
                    block_duration_seconds: null
                    block_created_at: null
                  summary: Auth-session успешно создана
                ПовторнаяВыдачаPendingAuth-session:
                  value:
                    session_uid: 550e8400-e29b-41d4-a716-446655440000
                    session_secret: secret-session-token
                    call_number: '+78001234567'
                    expires_at: '2026-03-24T12:00:00Z'
                    poll_interval_seconds: 2
                    attempt_number: 1
                    block_duration_seconds: null
                    block_created_at: null
                  summary: Повторная выдача pending auth-session
          description: Auth-session создана
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
              examples:
                НеверныйФорматНомера:
                  value:
                    phone_number:
                    - некорректный формат номера телефона, формат должен соответствовать
                      стандарту E164 - +1234567890, где N (0..9)
                  summary: Неверный формат номера
          description: Ошибка валидации запроса
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                PlusofonFlowОтключен:
                  value:
                    message: Авторизация через Plusofon отключена.
                  summary: Plusofon flow отключен
          description: Ошибка доступа auth-flow
        '409':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PlusofonPhoneAuthConflictResponse'
              examples:
                Auth-sessionУжеАктивна:
                  value:
                    message: Сессия авторизации уже активна. Дождитесь завершения
                      или истечения срока действия.
                  summary: Auth-session уже активна
          description: По номеру уже есть активная auth-session
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PlusofonPhoneAuthBlockedResponse'
              examples:
                ПерваяБлокировкаНомера:
                  value:
                    message: Слишком много попыток. Попробуйте снова через 10 минут
                    blocked_until: '2026-03-24T12:10:00Z'
                    attempt_number: 3
                    block_duration_seconds: 600
                    block_created_at: 1774353600.0
                  summary: Первая блокировка номера
                ПовторнаяБлокировкаНомера:
                  value:
                    message: Слишком много попыток. Попробуйте снова через 1 час
                    blocked_until: '2026-03-24T13:00:00Z'
                    attempt_number: 6
                    block_duration_seconds: 3600
                    block_created_at: 1774353600.0
                  summary: Повторная блокировка номера
          description: Номер телефона временно заблокирован для нового start
        '503':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                PlusofonВременноНедоступен:
                  value:
                    message: Авторизация через Plusofon временно недоступна.
                  summary: Plusofon временно недоступен
                PlusofonНеНастроен:
                  value:
                    message: Авторизация через Plusofon временно недоступна.
                  summary: Plusofon не настроен
          description: Провайдер временно недоступен

/api/v1/auth/providers/plusofon/flash-call/status/{session_uid}/:
post:
operationId: auth_providers_plusofon_flash_call_status_create
description: |-
Клиентский polling endpoint для проверки состояния auth-session после вызова `POST /api/v1/auth/providers/plusofon/flash-call/start/`.

        Pending-сессия живет 2 минуты, а verified-сессия живет 15 минут с момента подтверждения. Опрашивайте endpoint с интервалом в 2 сек.

        Описание полей ответа: `PlusofonPhoneAuthStatusResponse`
      summary: Получить статус auth-session Plusofon
      parameters:
      - in: path
        name: session_uid
        schema:
          type: string
          format: uuid
        required: true
      tags:
      - auth PLUSOFON
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PlusofonPhoneAuthSessionSecret'
            examples:
              ЗапросСтатусаAuth-session:
                value:
                  session_secret: secret-session-token
                summary: Запрос статуса auth-session
        required: true
      security:
      - jwtAuth: []
      - {}
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PlusofonPhoneAuthStatusResponse'
              examples:
                PendingAuth-session:
                  value:
                    session_uid: 550e8400-e29b-41d4-a716-446655440000
                    status: pending
                    expires_at: '2026-03-24T12:00:00Z'
                    verified_at: null
                    consumed_at: null
                    poll_interval_seconds: 2
                    is_claim_available: false
                  summary: Pending auth-session
                VerifiedAuth-session:
                  value:
                    session_uid: 550e8400-e29b-41d4-a716-446655440000
                    status: verified
                    expires_at: '2026-03-24T12:15:00Z'
                    verified_at: '2026-03-24T11:58:00Z'
                    consumed_at: null
                    poll_interval_seconds: 2
                    is_claim_available: true
                  summary: Verified auth-session
                ExpiredAuth-session:
                  value:
                    session_uid: 550e8400-e29b-41d4-a716-446655440000
                    status: expired
                    expires_at: '2026-03-24T12:00:00Z'
                    verified_at: null
                    consumed_at: null
                    poll_interval_seconds: 2
                    is_claim_available: false
                  summary: Expired auth-session
          description: Статус auth-session
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                НеверныйSessionSecret:
                  value:
                    message: Секрет auth-сессии не прошел проверку.
                  summary: Неверный session secret
          description: Session secret не прошел проверку
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
          description: Auth-session не найдена

/api/v1/chat/attachments/upload/:
post:
operationId: chat_attachments_upload_create
description: |-
Endpoint загружает файлы и изображения до отправки сообщения.

        Возвращает UID черновика вложения, который затем передается в message_attachment_uids при отправке сообщения.

        Описание полей ответа в `ChatAttachmentUploadResponse`
      summary: Загрузка файлов и изображений для сообщения
      tags:
      - media
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                files:
                  type: array
                  items:
                    type: string
                    format: binary
              required:
              - files
      security:
      - jwtAuth: []
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatAttachmentUploadResponse'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
          description: Ошибка валидации upload-запроса
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
              examples:
                ОшибкаАвторизации:
                  value:
                    detail: Учетные данные не были предоставлены.
                  summary: Ошибка авторизации
          description: Необходима авторизация

/api/v1/chat/attachments/upload/voice/:
post:
operationId: chat_attachments_upload_voice_create
description: |-
Endpoint загружает голосовое вложение до отправки сообщения.

        Механика работы:
        1. Принимает входные voice-файлы с расширениями .mp3, .ogg, .oga, .webm, .m4a, .aac.
        2. После успешной валидации нормализует любой поддержанный входной формат в единый выходной формат сервера: .m4a (audio/mp4, codec=aac).
        3. Возвращает UID черновика вложения, нормализованное имя файла и вычисленную сервером длительность.

        Для отправки сообщения клиент должен использовать UID из ответа.

        Описание полей ответа в `VoiceAttachmentUploadResult`.
      summary: Загрузка голосового сообщения для чата
      tags:
      - media
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
              required:
              - file
      security:
      - jwtAuth: []
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VoiceAttachmentUploadResult'
              examples:
                УспешнаяЗагрузкаVoiceПослеНормализации:
                  value:
                    uid: 4cbec0db-8b8e-4b58-848e-c2e5a2914d84
                    download_name: voice.m4a
                    media_kind: voice
                    upload_status: draft
                    duration_seconds: 12
                  summary: Успешная загрузка voice после нормализации
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
              examples:
                НеподдерживаемоеРасширениеVoiceФайла:
                  value:
                    file:
                    - Поддерживаются только voice файлы с расширением .mp3, .ogg,
                      .oga, .webm, .m4a, .aac.
                  summary: Неподдерживаемое расширение voice файла
                ДопустимоеРасширение,НоНеподдерживаемыйФактическийФормат:
                  value:
                    file:
                    - Расширение voice файла допустимо, но фактический формат файла
                      не поддерживается. Поддерживаются только voice файлы форматов
                      audio/ogg, audio/mpeg, audio/webm, audio/mp4, audio/aac.
                  summary: Допустимое расширение, но неподдерживаемый фактический
                    формат
          description: Ошибка валидации voice upload-запроса
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
              examples:
                ОшибкаАвторизации:
                  value:
                    detail: Учетные данные не были предоставлены.
                  summary: Ошибка авторизации
          description: Необходима авторизация

/api/v1/chat/calls/ice-servers/:
get:
operationId: chat_calls_ice_servers_list
description: "\n Возвращает список STUN и TURN серверов с временными
учетными данными для\n установки WebRTC соединения.\n Данные
генерируются динамически для текущего пользователя.\n Время жизни
учетных данных ограничено - 24 часа.\n\n Передать полученный массив
в конструктор:\n Web: new RTCPeerConnection({ iceServers })\n
\ iOS: RTCIceServer(urlStrings, username, credential)\n Android:
IceServer.builder(urls).setUsername().setPassword()\n\n\n Описание
полей смотрите в конце списка эндпоинтов Swagger UI,\n в разделе
Schemas.\n Используйте поиск по странице:\n - о полях
ответа: CallConfig\n "
summary: Получить список ICE серверов
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string
tags: - calls
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
type: array
items:
$ref: '#/components/schemas/CallConfig'
description: ''
/api/v1/chat/list/:
get:
operationId: chat_list_list
description: "\n Получение списка чатов.\n Доступен поиск
по username, nickname, first_name, last_name,\n patronymic и по
тексту сообщений в параметре `search`.\n Доступна сортировка по
is_favorite и last_activity_at.\n Для сортировки по времени последней
активности используйте\n last_activity_at (параметр: ordering).
Сортировка использует время создания\n последнего сообщения или
время создания чата.\n\n Примечания:\n - last_message.files_summary:
{'types': [mime,...], 'count': N} —\n до 3 уникальных MIME-типов;\n
\ - Поля могут быть null;\n\n Описание полей смотрите
в конце списка эндпоинтов Swagger UI,\n в разделе Schemas.\n
\ Используйте поиск по странице:\n - о полях ответа:
ChatList\n "
summary: Получение списка чатов
parameters: - in: query
name: is_active
schema:
type: boolean - in: query
name: is_blocked
schema:
type: boolean
description: заблокированные чаты - in: query
name: is_favorite
schema:
type: boolean - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - name: search
required: false
in: query
description: A search term.
schema:
type: string
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedChatListList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'414':
content:
application/json:
schema:
type: object
properties:
detail:
description: URI запроса слишком большой
type: string
example: Размер query-параметра превышает установленный лимит.
description: ''
/api/v1/chat/list/{id}/:
post:
operationId: chat_list_create
description: "\n Изменения свойств чата.\n Данные `id` чата берем
из responses метода `GET /api/v1/chat/list/`\n "
summary: Изменения свойств чата
parameters: - in: path
name: id
schema:
type: integer
required: true
tags: - chat
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/ChatPost'
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/ChatPost'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
message:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
delete:
operationId: chat_list_destroy
description: "\n Удаление своего чата вместе со всеми сообщениями в нем.\n
\ "
summary: Удаление своего чата
parameters: - in: path
name: id
schema:
type: integer
required: true
tags: - chat
security: - jwtAuth: []
responses:
'204':
description: No response body
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
/api/v1/chat/list/clear/{id}/:
post:
operationId: chat_list_clear_create
description: "\n Удаление всех сообщений в своем чате.\n "
summary: Очистка своего чата
parameters: - in: path
name: id
schema:
type: integer
required: true
tags: - chat
security: - jwtAuth: []
responses:
'204':
description: No response body
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
/api/v1/chat/list/generate-invite/{chat_key}/:
post:
operationId: chat_list_generate_invite_create
description: Создаёт JWT-приглашение для чата/канала; доступно только владельцу.
summary: Генерация пригласительной ссылки для группы/канала
parameters: - in: path
name: chat_key
schema:
type: string
required: true
tags: - chat
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/InviteLinkRequest'
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/InviteLink'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
message:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
/api/v1/chat/list/groups_or_channels/{chat_key}/:
get:
operationId: chat_list_groups_or_channels_retrieve
description: |-
Вернет группу или канал по chat_key.

        Доступно только аутентифицированному пользователю.
        Закрытые группы и каналы доступны только тем, кто участвует в этих
        чатах.
      summary: Получение группы или канала по chat_key
      parameters:
      - in: path
        name: chat_key
        schema:
          type: string
        required: true
      tags:
      - chat
      security:
      - jwtAuth: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatGroupOrChannelDoc'
          description: ''
        '401':
          content:
            application/json:
              schema:
                type: object
                properties:
                  detail:
                    description: Необходима авторизация
                    type: string
                    example: Учетные данные не были предоставлены.
          description: ''
        '403':
          content:
            application/json:
              schema:
                type: object
                properties:
                  detail:
                    description: Недостаточно прав доступа
                    type: string
                    example: У вас недостаточно прав для выполнения данного действия.
          description: ''
        '404':
          content:
            application/json:
              schema:
                type: object
                properties:
                  detail:
                    description: Страница не найдена
                    type: string
                    example: Страница не найдена.
          description: ''

/api/v1/chat/list/groups_or_channels/{chat_key}/participants/:
get:
operationId: chat_list_groups_or_channels_participants_list
description: "\n Получение списка всех активных участников группы или
канала.\n\n Особенности:\n - Владелец группы/канала всегда отображается
первым в списке\n - Доступен поиск по имени и фамилии (параметр search)\n
\ - Сортировка: владелец первый, остальные по дате добавления (новые
вверху)\n\n Права доступа:\n - Требуется аутентификация\n -
Публичные группы/каналы доступны всем авторизованным\n - Приватные
группы/каналы доступны только участникам\n\n Описание полей смотрите
в конце списка эндпоинтов Swagger UI,\n в разделе Schemas.\n Используйте
поиск по странице:\n - о полях ответа: GroupChannelParticipant\n "
summary: Получение списка участников группы/канала
parameters: - in: path
name: chat_key
schema:
type: string
required: true - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - name: search
required: false
in: query
description: A search term.
schema:
type: string
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedGroupChannelParticipantList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
/api/v1/chat/list/groups_or_channels/preview:
get:
operationId: chat_list_groups_or_channels_preview_retrieve
description: Возвращает минимальную информацию о группе/канале (name, description,
participants_count, avatar_webp) по jwt-токену из пригласительной ссылки.
summary: Превью группы/канала по invite-token
parameters: - in: query
name: token
schema:
type: string
description: JWT token из пригласительной ссылки
required: true
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/InvitePreview'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
message:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
'410':
content:
application/json:
schema:
type: object
properties:
detail:
description: Срок действия приглашения истек
type: string
example: Срок действия приглашения истек.
description: ''
'422':
content:
application/json:
schema:
type: object
properties:
detail:
description: Некорректный токен приглашения
type: string
example: Недействительный токен приглашения.
description: ''
/api/v1/chat/list/users-for-add/:
get:
operationId: chat_list_users_for_add_list
description: "\n Получение списка пользователей, которых можно добавить
в группу/канал.\n\n Источники пользователей:\n - Контакты текущего
пользователя (с привязкой к system_contact)\n - Собеседники из личных
чатов (chat_type='chat')\n\n Исключаются:\n - Сам текущий пользователь\n\n
\ Особенности:\n - Доступен поиск по имени и фамилии (параметр
search)\n - Результаты отсортированы по имени и фамилии\n -
Дубликаты исключены (пользователь может быть и в контактах,\n и
в чатах)\n\n Права доступа:\n - Требуется аутентификация\n\n
\ Описание полей смотрите в конце списка эндпоинтов Swagger UI,\n в
разделе Schemas.\n Используйте поиск по странице:\n - о полях
ответа: UserForAdd\n "
summary: Получение списка пользователей для добавления в группу/канал
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - name: search
required: false
in: query
description: A search term.
schema:
type: string
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedUserForAddList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
/api/v1/chat/media/preview/{file_uid}/{variant}/:
get:
operationId: chat_media_preview_retrieve
description: |-
Данный эндпоинт используется для получения превью-версий вложений (изображений).

        Ссылка формируется автоматически на бэкенде в ответах эндпоинтов сообщений и чатов.

        **Параметры пути:**
        - `file_uid`: Уникальный UUID вложения, к которому запрашивается доступ.
        - `variant`: Формат превью. Доступные варианты: `webp` (основной), `small` (запасной вариант), `micro` (иконка).

        **Параметры безопасности:**
        - `expires`: Unix timestamp истечения ссылки. Срок жизни подписи составляет 3600 секунд (1 час).
        - `signature`: HMAC-подпись, гарантирующая неизменность параметров.

        **Действия при истечении:**
        Если подпись истекла (HTTP 403), фронтенд должен повторно запросить данные сообщения или чата, чтобы получить новую подписанную ссылку.

        **Ответ:**
        В ответ приходит непосредственно содержимое файла (image/webp или image/jpeg). В продуктовой среде используется X-Accel-Redirect для эффективной отдачи через Nginx.
      summary: Получение signed preview вложения сообщения
      parameters:
      - in: path
        name: file_uid
        schema:
          type: string
        required: true
      - in: path
        name: variant
        schema:
          type: string
        required: true
      tags:
      - media
      security:
      - jwtAuth: []
      - {}
      responses:
        '200':
          description: Тело ответа формируется файловым сервером через X-Accel-Redirect.
            В локальной разработке endpoint возвращает preview напрямую.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
          description: Signed ссылка недействительна или истекла
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
          description: Preview не найден

/api/v1/chat/media/secure/{file_uid}/:
get:
operationId: chat_media_secure_retrieve
description: |-
Используется для получения защищенных файлов сообщений.

        Ссылка формируется автоматически на бэкенде в ответах эндпоинтов сообщений и чатов.

        **Ответ:**
         В ответ приходит непосредственно содержимое файла.

        В продуктовой среде используется X-Accel-Redirect для отдачи через Nginx.
      summary: Получение файла сообщения с авторизацией
      parameters:
      - in: path
        name: file_uid
        schema:
          type: string
        description: UUID файла сообщения
        required: true
      tags:
      - media
      security:
      - jwtAuth: []
      - {}
      responses:
        '200':
          description: Тело ответа формируется файловым сервером через X-Accel-Redirect.
            В локальной разработке endpoint возвращает содержимое файла напрямую.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
          description: Нет доступа к файлу
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
          description: Файл не найден

/api/v1/chat/message/file/{user_uid}/:
get:
operationId: chat_message_file_list
description: "\n Получение списка файлов в чате.\n Доступен поиск
по file_type в параметре search.\n "
summary: '!!! Не использовать. Легаси. Будет удален !!!'
parameters: - in: query
name: from_me
schema:
type: boolean
description: исходящие сообщения - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - in: query
name: range_time_end_created
schema:
type: string
description: сообщения созданные до... - in: query
name: range_time_end_updated
schema:
type: string
description: сообщения обновленные до... - in: query
name: range_time_start_created
schema:
type: string
description: сообщения созданные с... - in: query
name: range_time_start_updated
schema:
type: string
description: сообщения обновленные с... - name: search
required: false
in: query
description: A search term.
schema:
type: string - in: path
name: user_uid
schema:
type: string
required: true
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedGETMessageFileModelList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
'414':
content:
application/json:
schema:
type: object
properties:
detail:
description: URI запроса слишком большой
type: string
example: Размер query-параметра превышает установленный лимит.
description: ''
/api/v1/chat/message/files/{user_uid}/:
get:
operationId: chat_message_files_list
description: "\n Получение списка всех файлов из сообщений чата (личного,
группы\n или канала).\n\n Параметры:\n - user_uid: UID
собеседника (для личного чата) или UID виртуального\n пользователя
группы/канала\n\n Особенности:\n - Включает файлы из пересланных
сообщений\n - Доступна фильтрация по MIME-типу (параметр search)\n\n
\ Права доступа:\n - Требуется аутентификация\n - Публичные
группы/каналы доступны всем авторизованным (превью)\n - Приватные чаты/группы/каналы
доступны только участникам\n\n Описание полей смотрите в конце списка
эндпоинтов Swagger UI,\n в разделе Schemas.\n Используйте поиск
по странице:\n - о полях ответа: GroupChannelFile\n "
summary: Получение списка файлов чата
parameters: - in: query
name: is_active
schema:
type: boolean - in: query
name: is_blocked
schema:
type: boolean
description: заблокированные чаты - in: query
name: is_favorite
schema:
type: boolean - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - name: search
required: false
in: query
description: A search term.
schema:
type: string - in: path
name: user_uid
schema:
type: string
required: true
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedGroupChannelFileList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
/api/v1/chat/message/links/{user_uid}/:
get:
operationId: chat_message_links_list
description: "\n Получение списка всех ссылок из сообщений чата (личного,
группы\n или канала).\n\n Параметры:\n - user_uid: UID
собеседника (для личного чата) или UID виртуального\n пользователя
группы/канала\n\n Особенности:\n - Ограничение: только последние
500 сообщений (производительность)\n - Сортировка: новые ссылки вверху
(по created_at)\n - Включает информацию о пересылке ссылок\n\n Права
доступа:\n - Требуется аутентификация\n - Публичные группы/каналы
доступны всем авторизованным (превью)\n - Приватные чаты/группы/каналы
доступны только участникам\n\n Примечание: Для больших чатов с тысячами
сообщений парсинг\n ограничен последними 500 сообщениями для оптимизации
производительности.\n\n Описание полей смотрите в конце списка эндпоинтов
Swagger UI,\n в разделе Schemas.\n Используйте поиск по странице:\n
\ - о полях ответа: MessageLink\n "
summary: Получение списка ссылок чата
parameters: - in: query
name: is_active
schema:
type: boolean - in: query
name: is_blocked
schema:
type: boolean
description: заблокированные чаты - in: query
name: is_favorite
schema:
type: boolean - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - name: search
required: false
in: query
description: A search term.
schema:
type: string - in: path
name: user_uid
schema:
type: string
required: true
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedMessageLinkList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Недостаточно прав доступа
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
/api/v1/chat/message/text/{user_uid}/:
get:
operationId: chat_message_text_list
description: "\n Получение списка сообщений.\n Доступен поиск
по content в параметре search.\n Сортировка сообщений происходит по
created_at.\n "
summary: Получение списка сообщений пользователя или чата
parameters: - in: query
name: from_me
schema:
type: boolean
description: исходящие сообщения - in: query
name: new
schema:
type: boolean - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer - in: query
name: range_time_end_created
schema:
type: string
description: сообщения созданные до... - in: query
name: range_time_end_updated
schema:
type: string
description: сообщения обновленные до... - in: query
name: range_time_start_created
schema:
type: string
description: сообщения созданные с... - in: query
name: range_time_start_updated
schema:
type: string
description: сообщения обновленные с... - name: search
required: false
in: query
description: A search term.
schema:
type: string - in: path
name: user_uid
schema:
type: string
required: true
tags: - chat
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedRESTMessageList'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Страница не найдена
type: string
example: Страница не найдена.
description: ''
'414':
content:
application/json:
schema:
type: object
properties:
detail:
description: URI запроса слишком большой
type: string
example: Размер query-параметра превышает установленный лимит.
description: ''
/api/v1/chat/message/text/{user_uid}/search:
post:
operationId: chat_message_text_search_create
description: "\n Можно передать chat_page_size для указания позиции с
учетом пагинации.\n Поиск по content осуществляется регистронезависимо
по частичному\n совпадению.\n "
summary: 'Поиск позиции сообщения в чате по content или id_or_uid '
parameters: - in: query
name: ordering
schema:
type: string
description: Поля сортировки списка сообщений. - in: path
name: user_uid
schema:
type: string
required: true
tags: - chat
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SearchMessage'
required: true
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SearchMessage'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
message:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
/api/v1/contact/{user_uid}/:
get:
operationId: contact_retrieve
description: Получение пользователя по UID
summary: Получение пользователя
parameters: - in: path
name: user_uid
schema:
type: string
required: true
tags: - contact
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/ContactShortUser'
description: ''
'401':
content:
application/json:
schema:
description: Необходима авторизация
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'404':
content:
application/json:
schema:
type: object
properties:
detail:
description: Пользователь не найден
type: string
example: No User matches the given query.
description: ''
/api/v1/contact/blacklist/:
get:
operationId: contact_blacklist_list
description: Работа с черным списком
summary: Получение черного списка (с авторизацией)
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer
tags: - contact
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedBlacklistList'
description: ''
'401':
content:
application/json:
schema:
description: Необходима авторизация
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
/api/v1/contact/blacklist/add/{user_uid}/:
post:
operationId: contact_blacklist_add_create
description: Работа с черным списком
summary: Добавление в ЧС
parameters: - in: path
name: user_uid
schema:
type: string
required: true
tags: - contact
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/Blacklist'
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/Blacklist'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
field_name:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
description: Необходима авторизация
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
/api/v1/contact/blacklist/delete/{user_uid}/:
delete:
operationId: contact_blacklist_delete_destroy
description: Работа с черным списком
summary: Удаление из ЧС
parameters: - in: path
name: user_uid
schema:
type: string
required: true
tags: - contact
security: - jwtAuth: []
responses:
'204':
description: No response body
'400':
content:
application/json:
schema:
type: object
properties:
field_name:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
'401':
content:
application/json:
schema:
description: Необходима авторизация
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
/api/v1/contact/check/full-list/:
post:
operationId: contact_check_full_list_create
description: |-
Массовый поиск зарегистрированных пользователей (для мобильных устройств).

        Метод принимает полный список номеров телефонов или никнеймов (без лимита)
        и возвращает системную информацию о пользователях.
        Используется мобильным приложением для первичной или полной синхронизации
        всей адресной книги.
      summary: Массовый поиск зарегистрированных пользователей (без лимита)
      parameters:
      - name: ordering
        required: false
        in: query
        description: Which field to use when ordering the results.
        schema:
          type: string
      - name: page
        required: false
        in: query
        description: A page number within the paginated result set.
        schema:
          type: integer
      tags:
      - contact
      requestBody:
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/PhoneOrNickname'
        required: true
      security:
      - jwtAuth: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedContactUserList'
          description: ''
        '400':
          content:
            application/json:
              schema:
                type: object
                properties:
                  field_name:
                    description: Ошибка валидации запроса
                    type: string
                    example:
                    - Ошибка валидации запроса
          description: ''
        '401':
          content:
            application/json:
              schema:
                description: Необходима авторизация
                schema:
                  type: object
                  properties:
                    detail:
                      description: Необходима авторизация
                      type: string
                      example: Учетные данные не были предоставлены.
          description: ''

/api/v1/contact/check/list/:
post:
operationId: contact_check_list_create
description: |-
Проверка наличия пользователей в приложении (для мобильных устройств).

        Метод принимает список номеров телефонов или никнеймов (максимум 100)
        и возвращает краткую информацию о пользователях, которые уже зарегистрированы.
        Используется мобильным приложением для быстрой синхронизации части контактов.
      summary: Проверка наличия пользователей в приложении (лимит 100)
      parameters:
      - name: ordering
        required: false
        in: query
        description: Which field to use when ordering the results.
        schema:
          type: string
      - name: page
        required: false
        in: query
        description: A page number within the paginated result set.
        schema:
          type: integer
      tags:
      - contact
      requestBody:
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/PhoneOrNickname'
        required: true
      security:
      - jwtAuth: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedContactSuperShortUserList'
          description: ''
        '400':
          content:
            application/json:
              schema:
                type: object
                properties:
                  field_name:
                    description: Ошибка валидации запроса
                    type: string
                    example:
                    - Ошибка валидации запроса
          description: ''
        '401':
          content:
            application/json:
              schema:
                description: Необходима авторизация
                schema:
                  type: object
                  properties:
                    detail:
                      description: Необходима авторизация
                      type: string
                      example: Учетные данные не были предоставлены.
          description: ''

/api/v1/contact/messenger-add-by-phone/:
post:
operationId: contact_messenger_add_by_phone_create
description: Работа с контактами мессенджера
summary: Добавление контакта
tags: - contact
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/ContactCreateByPhone'
required: true
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/ContactRead'
description: ''
'400':
content:
application/json:
schema:
type: object
properties:
field_name:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
/api/v1/contact/messenger-bulk-create/:
post:
operationId: contact_messenger_bulk_create_create
description: Работа с контактами мессенджера
summary: Групповое добавление контактов по номерам телефонов
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer
tags: - contact
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/BulkCreateContact'
required: true
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedContactReadByUidList'
description: ''
/api/v1/contact/messenger-delete-contact/{uid}/:
delete:
operationId: contact_messenger_delete_contact_destroy
description: Работа с контактами мессенджера
summary: Удаление контакта по UID пользователя
parameters: - in: path
name: uid
schema:
type: string
required: true
tags: - contact
security: - jwtAuth: []
responses:
'204':
description: No response body
/api/v1/contact/messenger-list/:
get:
operationId: contact_messenger_list_list
description: Работа с контактами мессенджера
summary: Получение контактов в мессенджере
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer
tags: - contact
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedContactReadList'
description: ''
/api/v1/contact/messenger/bulk-delete/:
post:
operationId: contact_messenger_bulk_delete_create
description: Работа с контактами мессенджера
summary: Групповое удаление по UID записей контактов
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer - name: page_size
required: false
in: query
description: Number of results to return per page.
schema:
type: integer
tags: - contact
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/BulkDelete'
required: true
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedContactReadByUidList'
description: ''
/api/v1/contact/search/:
get:
operationId: contact_search_list
description: |-
Поиск выполняется по точному совпадению телефона, по префиксу nickname и по подстроке в имени, фамилии или полном имени.

        Из выдачи исключаются текущий пользователь, виртуальные, удаленные и неактивные аккаунты.
      summary: Глобальный поиск активных пользователей
      parameters:
      - name: ordering
        required: false
        in: query
        description: Which field to use when ordering the results.
        schema:
          type: string
      - name: page
        required: false
        in: query
        description: A page number within the paginated result set.
        schema:
          type: integer
      - name: page_size
        required: false
        in: query
        description: Number of results to return per page.
        schema:
          type: integer
      - in: query
        name: search
        schema:
          type: string
        description: Строка поиска по телефону, nickname, имени или фамилии
        required: true
      tags:
      - contact
      security:
      - jwtAuth: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedContactSearchUserList'
              examples:
                СовпадениеЕсть:
                  value:
                    count: 123
                    next: http://api.example.org/accounts/?page=4
                    previous: http://api.example.org/accounts/?page=2
                    results:
                    - uid: d24afb6c-ae13-4b8b-8fec-4b91e842546b
                      username: '+79042944485'
                      nickname: '9042944485'
                      first_name: Александр
                      last_name: Пушкин
                      phone: '+79042999985'
                      avatar_webp_url: http://localhost:8000/media/public/avatars_webp/user_d24afb6c-ae13-4b8b-8fec-4b91e842546b.webp?v=1773234800772791
                      avatar_small_url: http://localhost:8000/media/public/avatars_small/user_d24afb6c-ae13-4b8b-8fec-4b91e842546b.jpg?v=1773234800772791
                      is_online: true
                      was_online_at: 1773234800
                  summary: Совпадение есть
                СовпаденийНет:
                  value:
                    count: 123
                    next: http://api.example.org/accounts/?page=4
                    previous: http://api.example.org/accounts/?page=2
                    results:
                    - {}
                  summary: Совпадений нет
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactSearchValidationError'
              examples:
                ПустойSearch:
                  value:
                    search:
                    - Параметр search не может быть пустым.
                  summary: Пустой search
                ОтсутствуетSearch:
                  value:
                    search:
                    - Параметр search обязателен.
                  summary: Отсутствует search
          description: Ошибка валидации query-параметра search
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DetailResponse'
              examples:
                ОшибкаАвторизации:
                  value:
                    detail: Учетные данные не были предоставлены.
                  summary: Ошибка авторизации
          description: Необходима авторизация

/api/v1/media/avatar/master/{user_uid}/:
get:
operationId: media_avatar_master_retrieve
description: |-
Возвращает master-аватар пользователя.

        Ссылка формируется автоматически на бэкенде в ответах эндпоинтов.

        Доступ к аватару имеет только владелец и участники чата.

        Параметры:
        - user_uid: UID пользователя, чей аватар запрашивается.

        Ответ:
        - 200 OK: Возвращает файл аватара 1200x1200 в формате JPEG.
      summary: Получение аватара (avatar_master) пользователя
      parameters:
      - in: path
        name: user_uid
        schema:
          type: string
        required: true
      tags:
      - media
      security:
      - jwtAuth: []
      responses:
        '200':
          description: No response body
        '401':
          content:
            application/json:
              schema:
                type: object
                properties:
                  detail:
                    description: Необходима авторизация
                    type: string
                    example: Учетные данные не были предоставлены.
          description: ''
        '403':
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    description: Ошибка доступа
                    type: string
                    example: Ошибка доступа
          description: ''
        '404':
          content:
            application/json:
              schema:
                type: object
                properties:
                  detail:
                    description: Пользователь или аватар не найден
                    type: string
                    example: Объект не найден
          description: ''

/api/v1/media/upload/group-avatar/:
post:
operationId: media_upload_group_avatar_create
description: Upload-first endpoint для временного хранения аватара группы/канала
до момента её создания или изменения.
summary: Загрузка временного аватара группы/канала
tags: - media
requestBody:
content:
multipart/form-data:
schema:
type: object
properties:
file:
type: string
format: binary
description: Файл изображения аватара
required: - file
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/GroupAvatarUpload'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/ValidationError'
description: Ошибка валидации файла
'401':
content:
application/json:
schema:
$ref: '#/components/schemas/DetailResponse'
examples:
ОшибкаАвторизации:
value:
detail: Учетные данные не были предоставлены.
summary: Ошибка авторизации
description: Необходима авторизация
/api/v1/notifications/device_token/:
get:
operationId: notifications_device_token_list
parameters: - name: ordering
required: false
in: query
description: Which field to use when ordering the results.
schema:
type: string - name: page
required: false
in: query
description: A page number within the paginated result set.
schema:
type: integer
tags: - notifications
security: - jwtAuth: []
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/PaginatedDeviceTokenList'
description: ''
'414':
content:
application/json:
schema:
type: object
properties:
detail:
description: URI запроса слишком большой
type: string
example: Размер query-параметра превышает установленный лимит.
description: ''
post:
operationId: notifications_device_token_create
description: "\n Описание атрибутов\n\n device_token - токен устройства\n\n
\ app_type - тип приложения\n 0 - Доктор,\n 1 - Пациент\n
\ "
summary: Регистрация устройства
tags: - notifications
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/DeviceToken'
required: true
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/DeviceToken'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
detail:
description: Необходима авторизация
type: string
example: Учетные данные не были предоставлены.
description: ''
'403':
content:
application/json:
schema:
type: object
properties:
detail:
description: Действие запрещено.
type: string
example: У вас недостаточно прав для выполнения данного действия.
description: ''
/api/v1/service/message/:
post:
operationId: service_message_create
description: "\n Отправка сообщения в поддержку на почту chat@ktsf.ru\n
\ "
summary: Отправка сообщения в поддержку. Не реализовано.
tags: - service
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/ServiceMessage'
required: true
security: - jwtAuth: []
responses:
'201':
content:
application/json:
schema:
$ref: '#/components/schemas/ServiceMessage'
description: ''
'401':
content:
application/json:
schema:
type: object
properties:
message:
description: Ошибка валидации запроса
type: string
example: - Ошибка валидации запроса
description: ''
/api/v1/sfu/token/:
post:
operationId: sfu_token_create
description: |-
Генерирует и возвращает короткоживущий JWT, который клиент использует для подключения к SFU (для групповых звонков).

        Требуется авторизация. В теле ожидается JSON, например: {"chat_key": "group_74c6441b-c6f3-45bf-b0c0-5d08c9685936",}.

        Поле "chat_key" указывает на группу, для которой генерируется токен.
      summary: Выдача короткоживущего токена для SFU (ION)
      tags:
      - calls
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SFUTokenRequest'
        required: true
      security:
      - jwtAuth: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SFUTokenResponse'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                ОшибкаВалидации:
                  value:
                    detail: Ошибка валидации запроса
                  summary: Ошибка валидации
          description: Ошибка валидации запроса
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                ПользовательНеЯвляетсяУчастникомГруппы:
                  value:
                    detail: Пользователь не является участником группы
                  summary: Пользователь не является участником группы
          description: Пользователь не является участником группы
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                ГруппаНеНайдена:
                  value:
                    detail: Группа не найдена
                  summary: Группа не найдена
          description: Группа не найдена
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                ЗапросБылПроигнорирован:
                  value:
                    detail: Запрос был проигнорирован.
                  summary: Запрос был проигнорирован
          description: Превышен лимит запросов

/ws/chat::\_connect:
post:
operationId: \_connect_send
summary: Подключение
description: "\n Подключение происходит через авторизацию\n Это
может происходить двумя способами:\n\n Способ №1\n\n через параметр\n
\ /ws/chat?authorization={{token}}\n\n Способ №2\n\n через
заголовок\n Authorization=Token {{token}}\n\n где token - актуальный
токен пользователя\n "
tags: - web_socket
responses: null
/ws/chat::add_members_to_chat:
post:
operationId: add_members_to_chat_send
summary: Добавление пользователей в группу или канал
description: |-
Позволяет владельцу добавить новых участников в существующую группу или канал.

         Только владелец имеет право добавлять участников.

         Добавляемые пользователи получают уведомление о вступлении в чат.

         **История сообщений**:
        Для новых участников автоматически запускается асинхронная синхронизация истории сообщений (по умолчанию последние 1000 сообщений). Сообщения могут появиться с небольшой задержкой.

        Требуется передать список ID пользователей для добавления.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseAddMembersToChat'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestAddMembersToChat'

/ws/chat::answer_call:
post:
operationId: answer_call_send
summary: Ответ пользователя на вызов
description: |-
Отправляет ответ на входящий WebRTC вызов с SDP answer.

         Завершает процесс установления P2P соединения между участниками.

         Требует авторизацию и предварительно полученный вызов.

         Используется для подтверждения готовности к голосовому/видеообщению.
      tags:
      - webrtc_calls
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseAnswerForSwagger'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestCallAnswer'

/ws/chat::call_completion:
post:
operationId: call_completion_send
summary: Событие завершение звонка
description: |-
Для изменения сообщения о статусе звонка.

        Звонок может быть "не принят", "отклонен", "завершен".

        type_complete может принимать значения "unreceived", "rejected", "completed", соответственно.

        Можно указать продолжительность звонка duration в секундах.
      tags:
      - webrtc_calls
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseCallCompleteForSwagger'
          description: ''
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseNewCallMessageForSwagger'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestCallComplete'

/ws/chat::call_state_update:
post:
operationId: call_state_update_send
summary: Техническое состояние установления звонка
description: |-
Передаёт на сервер техническое состояние установления WebRTC соединения.

        Используется для подтверждения connected и раннего завершения при технической ошибке.

        Состояние connecting сервер дополнительно фиксирует автоматически при первом успешно принятом ICE candidate.

        **Поля объекта:**
        * **state**: Техническое состояние соединения.
          Допустимые значения: `connected` (успех), `failed` (ошибка).
        * **reason_code**: Машинный код причины ошибки. Обязателен для клиентского state=`failed`.

          Допустимые значения: `connection_timeout`, `ice_failed`, `peer_connection_failed`, `local_media_error`, `signaling_error`, `unknown_error`.

        **Когда отправлять reason_code:**
        * `connection_timeout`: клиент обычно не отправляет. Этот код выставляет сам сервер, если после `answer_call` соединение не перешло в `connected` за `CALL_CONNECTION_TIMEOUT_SECONDS` (сейчас 20 секунд).
        * `ice_failed`: отправлять, если WebRTC стек явно сообщил об ошибке ICE, например `iceConnectionState = failed`.
        * `peer_connection_failed`: отправлять, если `RTCPeerConnection` перешёл в `connectionState = failed`, но ошибка не локализуется только как ICE.
        * `local_media_error`: отправлять, если не удалось получить или инициализировать локальные медиа-устройства: `getUserMedia`, доступ к микрофону или камере.
        * `signaling_error`: отправлять, если клиент не смог корректно применить SDP/ICE данные текущей сессии: ошибка `setRemoteDescription`, `addIceCandidate`, конфликт сигнального состояния, повреждённый SDP.
        * `unknown_error`: отправлять только как fallback, когда сбой реально есть, но клиент не может надёжно отнести его к одной из категорий выше.

        **Таймауты сервера:**
        * После `offer_call` сервер ждёт `answer_call` в течение `CALL_MISSED_TIMEOUT` (сейчас 30 секунд). Если ответа нет, звонок завершается как `unreceived`.
        * После `answer_call` сервер ждёт `connected` в течение `CALL_CONNECTION_TIMEOUT_SECONDS` (сейчас 20 секунд). Если подтверждение не пришло, звонок завершается как `failed` с `reason_code=connection_timeout`.

        **Поведение сервера:**
        * Первый валидный `connected` от любого участника атомарно фиксирует звонок как connected. Повторные или гоняющиеся сигналы обрабатываются идемпотентно.
        * При `failed` сервер сохраняет `reason_code`, рассылает ответ `call_state_update`, затем системное событие `call_completion` со статусом `type_complete` = `failed` и, если создано связанное сообщение, `new_call_message`.
        * Для серверного таймаута соединения reason_code выставляется `connection_timeout`.
      tags:
      - webrtc_calls
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseCallStateUpdateForSwagger'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestCallStateUpdate'

/ws/chat::change_status_read_message:
post:
operationId: change_status_read_message_send
summary: Изменение статуса прочтения сообщения
description: |-
Отмечает сообщение как прочитанное получателем.

         Позволяет отслеживать статус доставки и прочтения сообщений в чате.

         Влияет только на собственные непрочитанные сообщения.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseChangeStatusReadMessage'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestChangeStatusReadMessage'

/ws/chat::clear*group_messages:
post:
operationId: clear_group_messages_send
summary: Очистка всех сообщений группы/канала
description: "\n Удаляет все сообщения группы/канала для ВСЕХ участников.\n\n
\ Доступно только владельцу. Требуется подтверждение (confirm=true).\n
\ Повторные запросы ограничены (rate limit) - не чаще одного раза в
минуту.\n\n Описание полей смотрите в конце списка эндпоинтов Swagger
UI,\n в разделе Schemas.\n Используйте поиск по странице:\n
\ - о полях ответа: SerializerResponseClearGroupMessages\n "
tags: - web_socket
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerResponseClearGroupMessages'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/WebSocketErrorResponse'
description: ''
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerRequestClearGroupMessages'
/ws/chat::create_chat:
post:
operationId: create_chat_send
summary: Создание группы или канала
description: "\n Создает новую группу или канал с указанными параметрами
и добавляет\n участников.\n\n Требуется авторизация. Создатель
автоматически становится владельцем.\n\n Параметры:\n - 'name':
Наименование группы/канала (обязательное)- должно быть\n от 1 до 100
символов\n - 'description': Описание группы/канала (опционально)- должно
быть не\n длиннее 250 символов\n - 'avatar': Аватар группы/канала
(минимум 320x320px,\n форматы JPEG/PNG/BMP, до 5МБ)\n - 'avatar_uid':
UID временно загруженного аватара группы/канала\n - 'chat_type': Тип
чата\n * 'public-group': открытая группа\n _ 'private-group':
закрытая группа\n _ 'public-channel': публичный канал\n \_
'private-channel': частный канал\n - 'uid_users_list': список идентификаторов
пользователей для\n добавления\n\n Пример участников: [\"3fa85f64-5717-4562-b3fc-2c963f66afa6\"]\n\n
\ После создания все участники получают уведомление о новом чате.\n
\ "
tags: - web_socket
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerResponseCreateChat'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/WebSocketErrorResponse'
description: ''
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerRequestCreateChat'
examples:
ПримерСозданияГруппы/канала:
value:
action: create_chat
request_uid: 3fa85f64-5717-4562-b3fc-2c963f66afa6
object:
name: string
description: string
avatar_uid: 3fa85f64-5717-4562-b3fc-2c963f66afa6
chat_type: private-group
uid_users_list: - string
summary: Пример запроса на создание группы/канала
/ws/chat::create_text_message:
post:
operationId: create_text_message_send
summary: Отправка сообщения в чат/группу/канал
description: |-
Отправляет текстовое сообщение или файлы в существующий чат или группу/канал, либо создает новый приватный чат между пользователями.

        При отправке в чат между пользователями передается `to_user_uid`.
        При отправке в группу/канал передается `chat_key`.

        Одновременное использование атрибутов `forwarded_messages` и `files` - невозможно.

        Поддерживает пересылку сообщений и вложения файлов.

        Ответ на сообщения в группе/канале значение поля будет следующим: `"to_user": null`
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WSCreateTextMessageSerializer'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestCreatingMessage'

/ws/chat::delete_chat:
post:
operationId: delete_chat_send
summary: Удаление чата или канала
description: |-
Удаление чата для всех участников или канала владельцем.

         Только владелец канала может удалить канал.

         После удаления все участники получают уведомление о закрытии чата.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseDeleteChat'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestDeleteChat'

/ws/chat::delete_message:
post:
operationId: delete_message_send
summary: Удаление сообщения
description: |-
Владелец группы может удалять любое сообщение как для себя так и для всех в группе.

        Участник группы может удалить свои сообщения как для себя так и для всех в группе.

        Участник группы может удалить чужие сообщения только для себя.

        Только владелец канала может удалять сообщения в канале.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseDeleteMessage'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestDeleteMessage'

/ws/chat::edit_chat:
post:
operationId: edit_chat_send
summary: Редактирование группы или канала
description: "Позволяет владельцу редактировать параметры существующей группы
или канала: \n\n- название - должно быть от 1 до 100 символов, \n\n- описание - должно быть не длиннее 250 символов,\n\n - аватар группы/канала (минимум
320x320px, форматы JPEG/PNG/BMP, до 5МБ),\n\n - UID временно загруженного
аватара группы/канала (поле avatar_uid),\n\n Тип доступа:\n\n - только владелец
имеет право изменять настройки чата."
tags: - web_socket
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerResponseEditChat'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/WebSocketErrorResponse'
description: ''
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerRequestEditChat'
examples:
ПримерРедактированияГруппы/канала:
value:
action: edit_chat
request_uid: 3fa85f64-5717-4562-b3fc-2c963f66afa6
object:
chat_key: string
name: string
description: string
avatar_uid: 3fa85f64-5717-4562-b3fc-2c963f66afa6
chat_type: chat
summary: Пример редактирования группы/канала
/ws/chat::get_status_list_chat:
post:
operationId: get_status_list_chat_send
summary: Получение списка статусов собственных чатов
description: |-
Возвращает информацию о статусах всех пользователей в чатах, где участвует текущий пользователь.

         Включает статус online/offline и время последней активности участников.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseGetStatusListChat'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializeRequestGetStatusListChat'

/ws/chat::ice_candidate:
post:
operationId: ice_candidate_send
summary: Событие обновления ICE кандидата
description: |
Пересылает ICE кандидаты для установления WebRTC соединения.
ICE кандидаты содержат информацию о сетевых путях для P2P связи.
tags: - webrtc_calls
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerResponseICECandidateForSwagger'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/WebSocketErrorResponse'
description: ''
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerRequestICECandidate'
/ws/chat::join_by_invite_link:
post:
operationId: join_by_invite_link_send
summary: Присоединение к чату по приглашению
description: |-
Обработчик вступления в чат по инвайт-ссылке.

        После успешного присоединения инициатор получает обычный ответ.
        Остальные участники чата получают push-уведомление с ключом `action`:

        ```json
        {
          "action": "member_added",
          "request_uid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "status": "OK",
          "error": null,
          "object": {
            "chat_key": "string",
            "chat_type": "string",
            "joined_user": {...}
          }
        ```
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseJoinByInviteLink'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestJoinByInviteLink'

/ws/chat::leave_chat:
post:
operationId: leave_chat_send
summary: Выход участника из группы/канала
description: |+
Обычные участники могут покидать группу/канал.

        Владелец группы/канала не может покидать их без передачи прав другому участнику.

        После выхода участники получают уведомление об успешном выходе.

      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseLeaveChat'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestLeaveChat'

/ws/chat::offer_call:
post:
operationId: offer_call_send
summary: Вызов пользователя
description: |-
Инициирует голосовой или видеовызов между пользователями через WebRTC.

         Отправляет SDP offer получателю для установления P2P соединения.

         Требует авторизацию и существование целевого пользователя.

         Автоматически создает или использует существующий чат между участниками.
      tags:
      - webrtc_calls
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseOfferForSwagger'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestCallOffer'

/ws/chat::remove_members_from_chat:
post:
operationId: remove_members_from_chat_send
summary: Удаление участников из группы/канала владельцем
description: |-
Позволяет владельцу удалить участников из группы или канала.
Только владелец имеет право удалять участников.

         Удаленные пользователи теряют доступ к группе/каналу.
         Участники получают уведомление об удалении.

          Требуется передать список UID пользователей.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseRemoveMembersFromChat'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestRemoveMembersFromChat'

/ws/chat::self_join_chat:
post:
operationId: self_join_chat_send
summary: Самостоятельное вступление в открытую группу/публичный канал
description: "Позволяет пользователю самому вступить в публичную группу или
публичный канал, указав `chat_key` \n\nВступление в закрытые группы и приватные
каналы запрещено."
tags: - web_socket
responses:
'200':
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerResponseJoinByInviteLink'
description: ''
'400':
content:
application/json:
schema:
$ref: '#/components/schemas/WebSocketErrorResponse'
description: ''
requestBody:
content:
application/json:
schema:
$ref: '#/components/schemas/SerializerRequestSelfJoin'
/ws/chat::transfer_owner:
post:
operationId: transfer_owner_send
summary: Передача прав владельца группы/канала другому участнику
description: |-
Позволяет текущему владельцу группы или канала передать права владельца другому участнику, который состоит в этой группе/канале.

        Новый владелец получает уведомление о передаче прав.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseTransferOwner'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestTransferOwner'

/ws/chat::update_message:
post:
operationId: update_message_send
summary: Редактирование сообщения
description: |-
Позволяет автору изменить содержимое ранее отправленного сообщения.

         Редактировать можно только собственные сообщения.

         Поддерживается изменение текста и замена файлов.

         Для замены вложений доступны два параллельных способа:

         - legacy-передача файлов через `files`,

         - новый upload-first flow через `message_attachment_uids`.

         Одновременное использование `files` и `message_attachment_uids` невозможно.
      tags:
      - web_socket
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SerializerResponseUpdateMessage'
          description: ''
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebSocketErrorResponse'
          description: ''
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SerializerRequestUpdatingMessage'

components:
schemas:
Action078Enum:
enum: - edit*chat
type: string
description: '* `edit_chat` - edit*chat'
Action0cdEnum:
enum: - remove_members_from_chat
type: string
description: '* `remove_members_from_chat` - remove*members_from_chat'
Action1dfEnum:
enum: - get_status_list_chat
type: string
description: '* `get_status_list_chat` - get*status_list_chat'
Action267Enum:
enum: - call_state_update
type: string
description: '* `call_state_update` - call*state_update'
Action40eEnum:
enum: - delete_chat
type: string
description: '* `delete_chat` - delete*chat'
Action433Enum:
enum: - offer_call
type: string
description: '* `offer_call` - offer*call'
Action472Enum:
enum: - create_chat
type: string
description: '* `create_chat` - create*chat'
Action477Enum:
enum: - change_status_read_message
type: string
description: '* `change_status_read_message` - change*status_read_message'
Action4d4Enum:
enum: - call_completion
type: string
description: '* `call_completion` - call*completion'
Action5caEnum:
enum: - answer_call
type: string
description: '* `answer_call` - answer*call'
Action8adEnum:
enum: - transfer_owner
type: string
description: '* `transfer_owner` - transfer*owner'
Action926Enum:
enum: - leave_chat
type: string
description: '* `leave_chat` - leave*chat'
ActionA6bEnum:
enum: - clear_group_messages
type: string
description: '* `clear_group_messages` - clear*group_messages'
ActionA7fEnum:
enum: - delete_message
type: string
description: '* `delete_message` - delete*message'
ActionBebEnum:
enum: - update_message
type: string
description: '* `update_message` - update*message'
ActionD1dEnum:
enum: - join_by_invite_link
type: string
description: '* `join_by_invite_link` - join*by_invite_link'
ActionE09Enum:
enum: - add_members_to_chat
type: string
description: '* `add_members_to_chat` - add*members_to_chat'
ActionF3cEnum:
enum: - ice_candidate
type: string
description: '* `ice_candidate` - ice\*candidate'
AppTypeEnum:
enum: - 0 - 1
type: integer
description: |-

- `0` - Приложение доктора
  _ `1` - Приложение пациента
  AvatarDataSerializer:
  type: object
  description: Сериализатор для данных аватара (имя файла и url).
  properties:
  filename:
  type: string
  description: Имя файла аватара
  url:
  type: string
  description: URL аватара
  required: - filename - url
  Blacklist:
  type: object
  description: Сериализатор черного списка.
  properties:
  blocked_user:
  allOf: - $ref: '#/components/schemas/ContactSuperShortUser'
readOnly: true
required: - blocked_user
BlankEnum:
enum: - ''
BulkCreateContact:
type: object
description: Сериализатор для группового создания контактов по номерам телефонов.
properties:
phones:
type: array
items:
type: string
description: Список телефонных номеров
required: - phones
BulkDelete:
type: object
description: Сериализатор для группового удаления контактов в мессенджере.
properties:
contact_uids:
type: array
items:
type: string
format: uuid
description: Список UID контактов (записей Contact) для удаления
required: - contact_uids
CallConfig:
type: object
description: Сериализатор для общей конфигурации WebRTC звонков.
properties:
ice_servers:
type: array
items:
$ref: '#/components/schemas/IceServer'
  required: - ice_servers
  CallStateEnum:
  enum: - answered - connecting - connected - failed
  type: string
  description: |-
  _ `answered` - answered
  _ `connecting` - connecting
  _ `connected` - connected
  \_ `failed` - failed
  ChatAttachmentUploadResponse:
  type: object
  description: Обёртка ответа batch upload endpoint-а.
  properties:
  results:
  type: array
  items:
  $ref: '#/components/schemas/ChatAttachmentUploadResult'
  required: - results
  ChatAttachmentUploadResult:
  type: object
  description: Результат загрузки вложения перед отправкой сообщения.
  properties:
  uid:
  type: string
  format: uuid
  readOnly: true
  download_name:
  type: string
  title: Имя файла для скачивания
  description: оригинальное имя файла для клиента
  maxLength: 255
  media_kind:
  allOf: - $ref: '#/components/schemas/MediaKindEnum'
  title: Тип медиа вложения
  description: |-
  классификация вложения по типу медиа

                      * `image` - Изображение
                      * `file` - Файл
                      * `voice` - Голосовое сообщение
                  upload_status:
                    allOf:
                    - $ref: '#/components/schemas/UploadStatusEnum'
                    title: Статус загрузки вложения
                    description: |-
                      жизненный цикл вложения

                      * `draft` - Черновик
                      * `attached` - Прикреплён
                      * `expired` - Истёк
                      * `deleted` - Удалён
                required:
                - uid
              ChatGroupOrChannelDoc:
                type: object
                description: Сериализатор для документации ответа с данными группы или канала.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  chat:
                    allOf:
                    - $ref: '#/components/schemas/ChatNotUser'
                    readOnly: true
                  is_active:
                    type: boolean
                    description: активный
                  is_favorite:
                    type: boolean
                    description: избранный
                  notifications:
                    type: boolean
                    readOnly: true
                    description: уведомления включены
                  index:
                    type: integer
                    maximum: 2147483647
                    minimum: -2147483648
                    description: индекс
                  message_count:
                    type: integer
                    readOnly: true
                    description: количество сообщений
                  file_count:
                    type: integer
                    readOnly: true
                    description: количество файлов
                  new_message_count:
                    type: integer
                    readOnly: true
                    description: количество новых сообщений
                  last_message:
                    allOf:
                    - $ref: '#/components/schemas/LastMessage'
                    readOnly: true
                    description: последнее сообщение
                  last_seen_message:
                    allOf:
                    - $ref: '#/components/schemas/IdAndUidMessageModel'
                    readOnly: true
                    description: последнее увиденное сообщение
                  first_new_message:
                    allOf:
                    - $ref: '#/components/schemas/IdAndUidMessageModel'
                    readOnly: true
                    description: первое новое сообщение
                  name:
                    type: string
                    readOnly: true
                    description: имя чата
                  chat_type:
                    allOf:
                    - $ref: '#/components/schemas/ChatGroupOrChannelDocChatTypeEnum'
                    readOnly: true
                  chat_key:
                    type: string
                    readOnly: true
                    description: код главного чата
                  description:
                    type: string
                    description: описание группы/канала
                  created_by:
                    type: string
                    readOnly: true
                    description: uid_создателя
                  owner_full_name:
                    type: string
                    readOnly: true
                    description: ФИО владельца канала/группы
                  participants:
                    type: array
                    items:
                      $ref: '#/components/schemas/Participant'
                    readOnly: true
                  created_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время создания
                  updated_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время обновления
                required:
                - chat
                - chat_key
                - chat_type
                - created_at
                - created_by
                - file_count
                - first_new_message
                - id
                - last_message
                - last_seen_message
                - message_count
                - name
                - new_message_count
                - notifications
                - owner_full_name
                - participants
                - updated_at
              ChatGroupOrChannelDocChatTypeEnum:
                enum:
                - public-group
                - private-group
                - public-channel
                - private-channel
                type: string
                description: |-
                  * `public-group` - открытая группа
                  * `private-group` - закрытая группа
                  * `public-channel` - публичный канал
                  * `private-channel` - частный канал
              ChatList:
                type: object
                description: |-
                  Сериализатор для списка чатов.

                  Использует prefetched данные для минимизации запросов к БД.
                  Все вычисления производятся на основе уже загруженных данных.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  chat:
                    allOf:
                    - $ref: '#/components/schemas/ChatUser'
                    readOnly: true
                  is_favorite:
                    type: boolean
                    description: избранный
                  notifications:
                    type: boolean
                    readOnly: true
                    description: уведомления включены
                  new_message_count:
                    type: integer
                    readOnly: true
                    description: количество новых сообщений
                  name:
                    type: string
                    readOnly: true
                    description: полное имя чата
                  chat_type:
                    allOf:
                    - $ref: '#/components/schemas/ChatType5a4Enum'
                    readOnly: true
                    description: |-
                      тип чата

                      * `chat` - личный
                      * `public-group` - открытая группа
                      * `private-group` - закрытая группа
                      * `public-channel` - публичный канал
                      * `private-channel` - частный канал
                  chat_key:
                    type: string
                    readOnly: true
                    description: код главного чата
                  created_by:
                    type: string
                    format: uuid
                    readOnly: true
                    description: UID создателя (владельца) чата
                  last_activity_at:
                    type: string
                    readOnly: true
                    description: дата последней активности
                  last_seen_message:
                    allOf:
                    - $ref: '#/components/schemas/IdAndUidMessageModel'
                    readOnly: true
                    description: последнее увиденное сообщение
                  first_new_message:
                    allOf:
                    - $ref: '#/components/schemas/IdAndUidMessageModel'
                    nullable: true
                    readOnly: true
                    description: первое новое сообщение
                  last_message:
                    allOf:
                    - $ref: '#/components/schemas/LastMessageLight'
                    description: последнее сообщение
                required:
                - chat
                - chat_key
                - chat_type
                - created_by
                - first_new_message
                - id
                - last_activity_at
                - last_message
                - last_seen_message
                - name
                - new_message_count
                - notifications
              ChatNotUser:
                type: object
                description: |-
                  Сериализатор для чата, не являющемся пользователем.

                  Используется для групп и каналов, где chat.chat — это User-заглушка.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - uid
              ChatObjectSerializer:
                type: object
                description: Универсальный сериализатор для object-поля чата/канала.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  chat_type:
                    type: string
                    description: Тип чата/канала
                required:
                - chat_key
                - chat_type
              ChatParticipantSerializer:
                type: object
                description: |-
                  Сериализатор для участника чата.

                  {
                      'uid': uid_пользователя,
                      'full_name': ФИО пользователя
                  }
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  full_name:
                    type: string
                    readOnly: true
                required:
                - full_name
                - uid
              ChatPost:
                type: object
                description: Сериализатор для редактирования свойств чата.
                properties:
                  is_favorite:
                    type: boolean
                    description: избранный
                  notifications:
                    type: boolean
                    description: уведомления включены
                  index:
                    type: integer
                    maximum: 2147483647
                    minimum: -2147483648
                    description: индекс
                  last_seen_message:
                    type: integer
                    nullable: true
                    title: Последнее увиденное сообщение
                    description: последнее увиденное сообщение
                  last_seen_message_uid:
                    type: string
                    format: uuid
                    readOnly: true
                    nullable: true
                    description: uid последнего увиденного сообщения
                required:
                - last_seen_message_uid
              ChatType5a4Enum:
                enum:
                - chat
                - public-group
                - private-group
                - public-channel
                - private-channel
                type: string
                description: |-
                  * `chat` - личный
                  * `public-group` - открытая группа
                  * `private-group` - закрытая группа
                  * `public-channel` - публичный канал
                  * `private-channel` - частный канал
              ChatUser:
                type: object
                description: |-
                  Сериализатор пользователя для списка чатов.

                  Включает информацию о блокировке, онлайн-статусе и наличии в контактах.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_blocked:
                    type: boolean
                    description: чат заблокирован
                    readOnly: true
                  is_online:
                    type: boolean
                    readOnly: true
                    description: статус подключения
                  was_online_at:
                    type: integer
                    nullable: true
                    readOnly: true
                    description: время последнего подключения
                  is_in_contacts:
                    type: boolean
                    description: пользователь в контактах
                    readOnly: true
                required:
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp_url
                - is_blocked
                - is_deleted
                - is_in_contacts
                - is_online
                - uid
                - was_online_at
              ClearGroupMessagesObjectSerializer:
                type: object
                description: Объект запроса для очистки сообщений группы/канала.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор группы/канала для очистки
                  confirm:
                    type: boolean
                    description: Подтверждение очистки всех сообщений
                required:
                - chat_key
                - confirm
              ClearGroupMessagesResponseObjectSerializer:
                type: object
                description: Объект ответа для очистки сообщений группы/канала.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор группы/канала
                  chat_type:
                    type: string
                    description: Тип чата (группа/канал)
                  cleared_by:
                    type: string
                    format: uuid
                    description: UID пользователя, выполнившего очистку
                required:
                - chat_key
                - chat_type
                - cleared_by
              ContactCreateByPhone:
                type: object
                description: Сериализатор для создания контакта по номеру телефона.
                properties:
                  phone:
                    type: string
                  first_name:
                    type: string
                  last_name:
                    type: string
                required:
                - phone
              ContactRead:
                type: object
                description: Сериализатор для чтения контакта.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                    title: Ид
                  owner_user:
                    type: string
                    format: uuid
                    title: Пользователь
                    readOnly: true
                  system_contact:
                    allOf:
                    - $ref: '#/components/schemas/ContactUserMini'
                    readOnly: true
                    description: контакт пользователя
                  first_name:
                    type: string
                    readOnly: true
                  last_name:
                    type: string
                    readOnly: true
                  phone:
                    type: string
                    readOnly: true
                required:
                - first_name
                - last_name
                - owner_user
                - phone
                - system_contact
                - uid
              ContactReadByUid:
                type: object
                description: Сериализатор для чтения контакта по UID.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  first_name:
                    type: string
                    readOnly: true
                  last_name:
                    type: string
                    readOnly: true
                required:
                - first_name
                - last_name
                - uid
              ContactSearchUser:
                type: object
                description: Сериализатор результата глобального поиска пользователей.
                properties:
                  uid:
                    type: string
                    format: uuid
                    title: Ид
                  username:
                    type: string
                    title: Имя пользователя
                    description: имя пользователя
                    maxLength: 250
                  nickname:
                    type: string
                    title: Nick Name
                    pattern: ^[a-z0-9._]{6,32}$
                    maxLength: 32
                  first_name:
                    type: string
                    readOnly: true
                    description: имя
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия
                  phone:
                    type: string
                    readOnly: true
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  is_online:
                    type: boolean
                    description: статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: время последнего подключения
                    readOnly: true
                required:
                - avatar_small_url
                - avatar_webp_url
                - first_name
                - is_online
                - last_name
                - nickname
                - phone
                - username
                - was_online_at
              ContactSearchValidationError:
                type: object
                description: Схема ошибки валидации параметра search.
                properties:
                  search:
                    type: array
                    items:
                      type: string
                    description: Список ошибок параметра search
                required:
                - search
              ContactShortUser:
                type: object
                description: Краткий сериализатор пользователя для контактов.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_filled:
                    type: boolean
                    readOnly: true
                    description: профиль заполнен
                  additional_information:
                    type: string
                    description: о себе
                  birthday:
                    type: string
                    description: временная метка дня рождения в секундах
                  is_online:
                    type: boolean
                    description: Статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: Время последнего подключения
                    readOnly: true
                  is_blocked:
                    type: boolean
                    readOnly: true
                    default: false
                  chat_id:
                    type: integer
                    readOnly: true
                    description: Идентификатор чата
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - chat_id
                - is_blocked
                - is_deleted
                - is_filled
                - is_online
                - uid
                - was_online_at
              ContactSuperShortUser:
                type: object
                description: Максимально краткий сериализатор пользователя для контактов.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  phone:
                    type: string
                    description: номер телефона
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  additional_information:
                    type: string
                    description: о себе
                  birthday:
                    type: string
                    description: временная метка дня рождения в секундах
                  chat_id:
                    type: integer
                    readOnly: true
                    description: Идентификатор чата
                  is_online:
                    type: boolean
                    description: Статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: Время последнего подключения
                    readOnly: true
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - chat_id
                - is_deleted
                - is_online
                - uid
                - was_online_at
              ContactUser:
                type: object
                description: Сериализатор пользователя для контакта.
                properties:
                  uid:
                    type: string
                    format: uuid
                    title: Ид
                  is_deleted:
                    type: boolean
                    readOnly: true
                  phone:
                    type: string
                    readOnly: true
                  is_online:
                    type: boolean
                    description: Статус подключения
                    readOnly: true
                  chat_id:
                    type: integer
                    readOnly: true
                    description: Идентификатор чата
                required:
                - chat_id
                - is_deleted
                - is_online
                - phone
              ContactUserMini:
                type: object
                description: Мини-сериализатор пользователя для контактов.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_online:
                    type: boolean
                    description: Статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: Время последнего подключения
                    readOnly: true
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - is_deleted
                - is_online
                - uid
                - was_online_at
              CountryEnum:
                enum:
                - AF
                - AX
                - AL
                - DZ
                - AS
                - AD
                - AO
                - AI
                - AQ
                - AG
                - AR
                - AM
                - AW
                - AU
                - AT
                - AZ
                - BS
                - BH
                - BD
                - BB
                - BY
                - BE
                - BZ
                - BJ
                - BM
                - BT
                - BO
                - BQ
                - BA
                - BW
                - BV
                - BR
                - IO
                - BN
                - BG
                - BF
                - BI
                - CV
                - KH
                - CM
                - CA
                - KY
                - CF
                - TD
                - CL
                - CN
                - CX
                - CC
                - CO
                - KM
                - CG
                - CD
                - CK
                - CR
                - CI
                - HR
                - CU
                - CW
                - CY
                - CZ
                - DK
                - DJ
                - DM
                - DO
                - EC
                - EG
                - SV
                - GQ
                - ER
                - EE
                - SZ
                - ET
                - FK
                - FO
                - FJ
                - FI
                - FR
                - GF
                - PF
                - TF
                - GA
                - GM
                - GE
                - DE
                - GH
                - GI
                - GR
                - GL
                - GD
                - GP
                - GU
                - GT
                - GG
                - GN
                - GW
                - GY
                - HT
                - HM
                - VA
                - HN
                - HK
                - HU
                - IS
                - IN
                - ID
                - IR
                - IQ
                - IE
                - IM
                - IL
                - IT
                - JM
                - JP
                - JE
                - JO
                - KZ
                - KE
                - KI
                - KW
                - KG
                - LA
                - LV
                - LB
                - LS
                - LR
                - LY
                - LI
                - LT
                - LU
                - MO
                - MG
                - MW
                - MY
                - MV
                - ML
                - MT
                - MH
                - MQ
                - MR
                - MU
                - YT
                - MX
                - FM
                - MD
                - MC
                - MN
                - ME
                - MS
                - MA
                - MZ
                - MM
                - NA
                - NR
                - NP
                - NL
                - NC
                - NZ
                - NI
                - NE
                - NG
                - NU
                - NF
                - KP
                - MK
                - MP
                - 'NO'
                - OM
                - PK
                - PW
                - PS
                - PA
                - PG
                - PY
                - PE
                - PH
                - PN
                - PL
                - PT
                - PR
                - QA
                - RE
                - RO
                - RU
                - RW
                - BL
                - SH
                - KN
                - LC
                - MF
                - PM
                - VC
                - WS
                - SM
                - ST
                - SA
                - SN
                - RS
                - SC
                - SL
                - SG
                - SX
                - SK
                - SI
                - SB
                - SO
                - ZA
                - GS
                - KR
                - SS
                - ES
                - LK
                - SD
                - SR
                - SJ
                - SE
                - CH
                - SY
                - TW
                - TJ
                - TZ
                - TH
                - TL
                - TG
                - TK
                - TO
                - TT
                - TN
                - TR
                - TM
                - TC
                - TV
                - UG
                - UA
                - AE
                - GB
                - UM
                - US
                - UY
                - UZ
                - VU
                - VE
                - VN
                - VG
                - VI
                - WF
                - EH
                - YE
                - ZM
                - ZW
                type: string
                description: |-
                  * `AF` - Afghanistan
                  * `AX` - Åland Islands
                  * `AL` - Albania
                  * `DZ` - Algeria
                  * `AS` - American Samoa
                  * `AD` - Andorra
                  * `AO` - Angola
                  * `AI` - Anguilla
                  * `AQ` - Antarctica
                  * `AG` - Antigua and Barbuda
                  * `AR` - Argentina
                  * `AM` - Armenia
                  * `AW` - Aruba
                  * `AU` - Australia
                  * `AT` - Austria
                  * `AZ` - Azerbaijan
                  * `BS` - Bahamas
                  * `BH` - Bahrain
                  * `BD` - Bangladesh
                  * `BB` - Barbados
                  * `BY` - Belarus
                  * `BE` - Belgium
                  * `BZ` - Belize
                  * `BJ` - Benin
                  * `BM` - Bermuda
                  * `BT` - Bhutan
                  * `BO` - Bolivia
                  * `BQ` - Bonaire, Sint Eustatius and Saba
                  * `BA` - Bosnia and Herzegovina
                  * `BW` - Botswana
                  * `BV` - Bouvet Island
                  * `BR` - Brazil
                  * `IO` - British Indian Ocean Territory
                  * `BN` - Brunei
                  * `BG` - Bulgaria
                  * `BF` - Burkina Faso
                  * `BI` - Burundi
                  * `CV` - Cabo Verde
                  * `KH` - Cambodia
                  * `CM` - Cameroon
                  * `CA` - Canada
                  * `KY` - Cayman Islands
                  * `CF` - Central African Republic
                  * `TD` - Chad
                  * `CL` - Chile
                  * `CN` - China
                  * `CX` - Christmas Island
                  * `CC` - Cocos (Keeling) Islands
                  * `CO` - Colombia
                  * `KM` - Comoros
                  * `CG` - Congo
                  * `CD` - Congo (the Democratic Republic of the)
                  * `CK` - Cook Islands
                  * `CR` - Costa Rica
                  * `CI` - Côte d'Ivoire
                  * `HR` - Croatia
                  * `CU` - Cuba
                  * `CW` - Curaçao
                  * `CY` - Cyprus
                  * `CZ` - Czechia
                  * `DK` - Denmark
                  * `DJ` - Djibouti
                  * `DM` - Dominica
                  * `DO` - Dominican Republic
                  * `EC` - Ecuador
                  * `EG` - Egypt
                  * `SV` - El Salvador
                  * `GQ` - Equatorial Guinea
                  * `ER` - Eritrea
                  * `EE` - Estonia
                  * `SZ` - Eswatini
                  * `ET` - Ethiopia
                  * `FK` - Falkland Islands (Malvinas)
                  * `FO` - Faroe Islands
                  * `FJ` - Fiji
                  * `FI` - Finland
                  * `FR` - France
                  * `GF` - French Guiana
                  * `PF` - French Polynesia
                  * `TF` - French Southern Territories
                  * `GA` - Gabon
                  * `GM` - Gambia
                  * `GE` - Georgia
                  * `DE` - Germany
                  * `GH` - Ghana
                  * `GI` - Gibraltar
                  * `GR` - Greece
                  * `GL` - Greenland
                  * `GD` - Grenada
                  * `GP` - Guadeloupe
                  * `GU` - Guam
                  * `GT` - Guatemala
                  * `GG` - Guernsey
                  * `GN` - Guinea
                  * `GW` - Guinea-Bissau
                  * `GY` - Guyana
                  * `HT` - Haiti
                  * `HM` - Heard Island and McDonald Islands
                  * `VA` - Holy See
                  * `HN` - Honduras
                  * `HK` - Hong Kong
                  * `HU` - Hungary
                  * `IS` - Iceland
                  * `IN` - India
                  * `ID` - Indonesia
                  * `IR` - Iran
                  * `IQ` - Iraq
                  * `IE` - Ireland
                  * `IM` - Isle of Man
                  * `IL` - Israel
                  * `IT` - Italy
                  * `JM` - Jamaica
                  * `JP` - Japan
                  * `JE` - Jersey
                  * `JO` - Jordan
                  * `KZ` - Kazakhstan
                  * `KE` - Kenya
                  * `KI` - Kiribati
                  * `KW` - Kuwait
                  * `KG` - Kyrgyzstan
                  * `LA` - Laos
                  * `LV` - Latvia
                  * `LB` - Lebanon
                  * `LS` - Lesotho
                  * `LR` - Liberia
                  * `LY` - Libya
                  * `LI` - Liechtenstein
                  * `LT` - Lithuania
                  * `LU` - Luxembourg
                  * `MO` - Macao
                  * `MG` - Madagascar
                  * `MW` - Malawi
                  * `MY` - Malaysia
                  * `MV` - Maldives
                  * `ML` - Mali
                  * `MT` - Malta
                  * `MH` - Marshall Islands
                  * `MQ` - Martinique
                  * `MR` - Mauritania
                  * `MU` - Mauritius
                  * `YT` - Mayotte
                  * `MX` - Mexico
                  * `FM` - Micronesia
                  * `MD` - Moldova
                  * `MC` - Monaco
                  * `MN` - Mongolia
                  * `ME` - Montenegro
                  * `MS` - Montserrat
                  * `MA` - Morocco
                  * `MZ` - Mozambique
                  * `MM` - Myanmar
                  * `NA` - Namibia
                  * `NR` - Nauru
                  * `NP` - Nepal
                  * `NL` - Netherlands
                  * `NC` - New Caledonia
                  * `NZ` - New Zealand
                  * `NI` - Nicaragua
                  * `NE` - Niger
                  * `NG` - Nigeria
                  * `NU` - Niue
                  * `NF` - Norfolk Island
                  * `KP` - North Korea
                  * `MK` - North Macedonia
                  * `MP` - Northern Mariana Islands
                  * `NO` - Norway
                  * `OM` - Oman
                  * `PK` - Pakistan
                  * `PW` - Palau
                  * `PS` - Palestine, State of
                  * `PA` - Panama
                  * `PG` - Papua New Guinea
                  * `PY` - Paraguay
                  * `PE` - Peru
                  * `PH` - Philippines
                  * `PN` - Pitcairn
                  * `PL` - Poland
                  * `PT` - Portugal
                  * `PR` - Puerto Rico
                  * `QA` - Qatar
                  * `RE` - Réunion
                  * `RO` - Romania
                  * `RU` - Russia
                  * `RW` - Rwanda
                  * `BL` - Saint Barthélemy
                  * `SH` - Saint Helena, Ascension and Tristan da Cunha
                  * `KN` - Saint Kitts and Nevis
                  * `LC` - Saint Lucia
                  * `MF` - Saint Martin (French part)
                  * `PM` - Saint Pierre and Miquelon
                  * `VC` - Saint Vincent and the Grenadines
                  * `WS` - Samoa
                  * `SM` - San Marino
                  * `ST` - Sao Tome and Principe
                  * `SA` - Saudi Arabia
                  * `SN` - Senegal
                  * `RS` - Serbia
                  * `SC` - Seychelles
                  * `SL` - Sierra Leone
                  * `SG` - Singapore
                  * `SX` - Sint Maarten (Dutch part)
                  * `SK` - Slovakia
                  * `SI` - Slovenia
                  * `SB` - Solomon Islands
                  * `SO` - Somalia
                  * `ZA` - South Africa
                  * `GS` - South Georgia and the South Sandwich Islands
                  * `KR` - South Korea
                  * `SS` - South Sudan
                  * `ES` - Spain
                  * `LK` - Sri Lanka
                  * `SD` - Sudan
                  * `SR` - Suriname
                  * `SJ` - Svalbard and Jan Mayen
                  * `SE` - Sweden
                  * `CH` - Switzerland
                  * `SY` - Syria
                  * `TW` - Taiwan
                  * `TJ` - Tajikistan
                  * `TZ` - Tanzania
                  * `TH` - Thailand
                  * `TL` - Timor-Leste
                  * `TG` - Togo
                  * `TK` - Tokelau
                  * `TO` - Tonga
                  * `TT` - Trinidad and Tobago
                  * `TN` - Tunisia
                  * `TR` - Türkiye
                  * `TM` - Turkmenistan
                  * `TC` - Turks and Caicos Islands
                  * `TV` - Tuvalu
                  * `UG` - Uganda
                  * `UA` - Ukraine
                  * `AE` - United Arab Emirates
                  * `GB` - United Kingdom
                  * `UM` - United States Minor Outlying Islands
                  * `US` - United States of America
                  * `UY` - Uruguay
                  * `UZ` - Uzbekistan
                  * `VU` - Vanuatu
                  * `VE` - Venezuela
                  * `VN` - Vietnam
                  * `VG` - Virgin Islands (British)
                  * `VI` - Virgin Islands (U.S.)
                  * `WF` - Wallis and Futuna
                  * `EH` - Western Sahara
                  * `YE` - Yemen
                  * `ZM` - Zambia
                  * `ZW` - Zimbabwe
              DetailResponse:
                type: object
                properties:
                  detail:
                    type: string
                    description: Описание ошибки или статуса
                required:
                - detail
              DeviceToken:
                type: object
                description: Сериализатор токена устройств
                properties:
                  device_token:
                    type: string
                    title: Токен устройства
                    maxLength: 256
                  app_type:
                    allOf:
                    - $ref: '#/components/schemas/AppTypeEnum'
                    title: Тип приложения
                    minimum: -32768
                    maximum: 32767
                required:
                - app_type
                - device_token
              ErrorResponse:
                type: object
                properties:
                  detail:
                    type: string
                required:
                - detail
              FieldEnum:
                enum:
                - id_or_uid
                - content
                type: string
                description: |-
                  * `id_or_uid` - id_or_uid
                  * `content` - content
              FilesSummary:
                type: object
                description: Сериализатор для краткой информации о файлах сообщения.
                properties:
                  types:
                    type: array
                    items:
                      type: string
                    description: список уникальных MIME-типов (максимум 3)
                  count:
                    type: integer
                    description: общее количество файлов
                required:
                - count
                - types
              ForwardedIn:
                type: object
                description: Сериализатор информации о пересылке сообщения.
                properties:
                  id:
                    type: integer
                    description: id сообщения
                  uid:
                    type: string
                    format: uuid
                    description: uid сообщения
                  from_user:
                    type: string
                    description: автор сообщения
                required:
                - from_user
                - id
                - uid
              ForwardedMessagesSerializer:
                type: object
                description: 'LEGACY: пересланные сообщения с именем автора.'
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    type: string
                    readOnly: true
                    description: автор сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/SuperShortFileModelSerializer'
                    readOnly: true
                    description: список файлов
                  first_name:
                    type: string
                    readOnly: true
                    description: имя автора пересылаемого сообщения
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия автора пересылаемого сообщения
                required:
                - files_list
                - first_name
                - from_user
                - id
                - last_name
                - uid
              GETMessageFileModel:
                type: object
                description: Файлы для консультаций с информацией о пересылке.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUser'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUser'
                    readOnly: true
                  message_id:
                    type: integer
                    description: идентификатор к которому привязан файл (не обязательное поле)
                  forwarded_in:
                    type: array
                    items:
                      $ref: '#/components/schemas/ForwardedIn'
                    readOnly: true
                    description: переслано в сообщении
                  file:
                    type: string
                    description: файл
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp:
                    type: string
                    description: файл webp
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  size:
                    type: integer
                    readOnly: true
                    description: размер файла в байтах
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                required:
                - created_at
                - download_name
                - file
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp
                - file_webp_url
                - forwarded_in
                - from_user
                - id
                - media_kind
                - size
                - to_user
                - uid
                - updated_at
              GETMessageModelSerializer:
                type: object
                description: |-
                  LEGACY: Сериализатор сообщений для WebSocket.

                  Используется в WebSocket-консьюмерах.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  replied_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/ShortMessageModelSerializer'
                    description: ответ на
                  forwarded_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/ForwardedMessagesSerializer'
                    description: пересылаемые сообщения
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/SuperShortFileModelSerializer'
                    readOnly: true
                    description: список файлов
                  new:
                    type: boolean
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  chat_id:
                    type: integer
                    nullable: true
                    description: чат сообщения
                    readOnly: true
                  chat_key:
                    type: string
                    nullable: true
                    description: Идентификатор чата/канала
                    readOnly: true
                  chat_type:
                    type: string
                    nullable: true
                    description: Тип чата
                    readOnly: true
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/ShortRTCModelSerializer'
                    nullable: true
                    readOnly: true
                    description: объект звонка привязанного к этому сообщению
                required:
                - chat_id
                - chat_key
                - chat_type
                - created_at
                - files_list
                - forwarded_messages
                - from_user
                - id
                - message_rtc
                - new
                - replied_messages
                - to_user
                - uid
                - updated_at
              GETNewCallMessageSerializer:
                type: object
                description: 'LEGACY: Сериализатор для сообщения о звонке (new_call_message).'
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  replied_messages:
                    type: string
                    readOnly: true
                  forwarded_messages:
                    type: string
                    readOnly: true
                  files_list:
                    type: string
                    readOnly: true
                  new:
                    type: boolean
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  chat_id:
                    type: integer
                    nullable: true
                    description: чат сообщения
                    readOnly: true
                  chat_key:
                    type: string
                    nullable: true
                    description: Идентификатор чата/канала
                    readOnly: true
                  chat_type:
                    type: string
                    nullable: true
                    description: Тип чата
                    readOnly: true
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/ShortRTCModelSerializer'
                    nullable: true
                    readOnly: true
                    description: объект звонка привязанного к этому сообщению
                required:
                - chat_id
                - chat_key
                - chat_type
                - created_at
                - files_list
                - forwarded_messages
                - from_user
                - id
                - message_rtc
                - new
                - replied_messages
                - to_user
                - uid
                - updated_at
              GenderEnum:
                enum:
                - male
                - female
                type: string
                description: |-
                  * `male` - Мужчина
                  * `female` - Женщина
              GroupAvatarUpload:
                type: object
                description: Сериализатор REST-загрузки временного аватара группы/канала.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  file:
                    type: string
                    format: uri
                    writeOnly: true
                required:
                - file
                - uid
              GroupChannelFile:
                type: object
                description: Сериализатор для файлов в группах и каналах REST API.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  message_id:
                    type: integer
                    readOnly: true
                    description: идентификатор сообщения к которому привязан файл
                  forwarded_in:
                    type: array
                    items:
                      $ref: '#/components/schemas/ForwardedIn'
                    readOnly: true
                    description: список сообщений, в которых переслали файл
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  size:
                    type: integer
                    readOnly: true
                    description: размер файла в байтах
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                required:
                - created_at
                - download_name
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp_url
                - forwarded_in
                - id
                - media_kind
                - message_id
                - size
                - uid
                - updated_at
              GroupChannelParticipant:
                type: object
                description: |-
                  Сериализатор участника группы/канала для REST API.

                  Возвращает минимальный набор полей для списка участников
                  с пометкой владельца чата, статусом онлайн и информацией о блокировке.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  first_name:
                    type: string
                    readOnly: true
                    description: имя
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_owner:
                    type: boolean
                    readOnly: true
                    description: является ли пользователь владельцем группы/канала
                  is_blocked:
                    type: boolean
                    description: чат заблокирован
                    readOnly: true
                  is_online:
                    type: boolean
                    description: статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: время последнего подключения (timestamp)
                    readOnly: true
                  is_in_contacts:
                    type: boolean
                    description: пользователь в контактах
                    readOnly: true
                required:
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp_url
                - first_name
                - is_blocked
                - is_deleted
                - is_in_contacts
                - is_online
                - is_owner
                - last_name
                - uid
                - was_online_at
              IceServer:
                type: object
                description: Сериализатор для отдельного ICE сервера.
                properties:
                  urls:
                    type: array
                    items:
                      type: string
                    description: Список URL серверов.
                  username:
                    type: string
                    description: Имя пользователя для TURN сервера.
                  credential:
                    type: string
                    description: Пароль для TURN сервера.
                required:
                - urls
              IdAndUidMessageModel:
                type: object
                description: Минимальный сериализатор для идентификации сообщения.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                required:
                - id
                - uid
              InviteLink:
                type: object
                description: Сериализатор ответа при генерации пригласительной ссылки.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  chat_type:
                    type: string
                    description: Тип чата
                  invite_link:
                    type: string
                    description: Сгенерированная пригласительная ссылка
                  expires_at:
                    type: integer
                    description: Временная метка истечения срока
                required:
                - chat_key
                - chat_type
                - expires_at
                - invite_link
              InviteLinkRequest:
                type: object
                description: |-
                  Сериализатор входных данных для REST-эндпойнта генерации приглашения.

                  Ожидает только поле expires_in (в секундах). Chat key передаётся в URL,
                  поэтому в теле запроса не нужен.
                properties:
                  expires_in:
                    type: integer
                    maximum: 2592000
                    minimum: 60
                    default: 86400
                    description: срок действия ссылки в секундах
              InvitePreview:
                type: object
                description: Сериализатор ответа для превью группы/канала по invite-token.
                properties:
                  name:
                    type: string
                    description: Название группы/канала
                  description:
                    type: string
                    nullable: true
                    description: Описание группы/канала
                  participants_count:
                    type: integer
                    description: Количество активных участников
                  avatar_webp_url:
                    type: string
                    nullable: true
                    description: URL к webp-аватару для превью
                required:
                - name
                - participants_count
              JoinByInviteLinkObjectSerializer:
                type: object
                description: Сериализатор для object-поля при присоединении по ссылке.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  chat_type:
                    type: string
                    description: Тип чата
                  joined_user:
                    allOf:
                    - $ref: '#/components/schemas/ChatParticipantSerializer'
                    description: Данные пользователя, присоединившегося к чату
                required:
                - chat_key
                - chat_type
              LastMessage:
                type: object
                description: Сериализатор для последнего сообщения в списке чатов.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    type: string
                    readOnly: true
                    description: автор сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/SuperShortFileModel'
                    readOnly: true
                    description: список файлов
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  replied_messages:
                    type: array
                    items:
                      type: integer
                    description: ответ на
                  forwarded_messages:
                    type: array
                    items:
                      type: integer
                    description: пересылаемые сообщения
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - created_at
                - files_list
                - from_user
                - id
                - uid
                - updated_at
              LastMessageLight:
                type: object
                description: Легкий сериализатор для last_message в списке чатов.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    type: string
                    format: uuid
                    title: От кого
                    description: автор сообщения
                  content:
                    type: string
                    readOnly: true
                  files_summary:
                    allOf:
                    - $ref: '#/components/schemas/FilesSummary'
                    readOnly: true
                    description: краткая информация о файлах
                  has_replied_message:
                    type: boolean
                    readOnly: true
                    description: есть ли ответные сообщения
                  has_forwarded_message:
                    type: boolean
                    readOnly: true
                    description: есть ли пересланные сообщения
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/MessageRTCLight'
                    nullable: true
                    readOnly: true
                    description: информация о звонке
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - content
                - created_at
                - files_summary
                - from_user
                - has_forwarded_message
                - has_replied_message
                - id
                - message_rtc
                - uid
                - updated_at
              LeaveChatObjectSerializer:
                type: object
                description: Сериализатор для object-поля при выходе из чата.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата
                  chat_type:
                    type: string
                    description: Тип чата
                  left_user:
                    allOf:
                    - $ref: '#/components/schemas/ChatParticipantSerializer'
                    description: Данные пользователя, покинувшего чат
                required:
                - chat_key
                - chat_type
                - left_user
              LinkUser:
                type: object
                description: Сериализатор пользователя для ссылки (только имя и фамилия).
                properties:
                  first_name:
                    type: string
                    description: имя отправителя сообщения
                  last_name:
                    type: string
                    description: фамилия отправителя сообщения
                required:
                - first_name
                - last_name
              MediaKindEnum:
                enum:
                - image
                - file
                - voice
                type: string
                description: |-
                  * `image` - Изображение
                  * `file` - Файл
                  * `voice` - Голосовое сообщение
              MessageLink:
                type: object
                description: Сериализатор ссылки из сообщения чата.
                properties:
                  url:
                    type: string
                    format: uri
                    description: URL ссылки
                  title:
                    type: string
                    description: текст ссылки (домен)
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/LinkUser'
                    description: автор сообщения со ссылкой
                  message_id:
                    type: integer
                    description: идентификатор сообщения, содержащего ссылку
                  forwarded_in:
                    type: array
                    items:
                      $ref: '#/components/schemas/ForwardedIn'
                    readOnly: true
                    description: список сообщений, в которых переслали сообщение со ссылкой
                  created_at:
                    type: string
                    description: время создания сообщения
                  updated_at:
                    type: string
                    description: время обновления сообщения
                required:
                - created_at
                - forwarded_in
                - from_user
                - message_id
                - title
                - updated_at
                - url
              MessageRTCLight:
                type: object
                description: Легкий сериализатор информации о звонке для списка чатов.
                properties:
                  status:
                    type: string
                    description: статус звонка
                required:
                - status
              MessageResponse:
                type: object
                properties:
                  message:
                    type: string
                    description: Текстовое сообщение
                required:
                - message
              MessengerAvatarModel:
                type: object
                description: |-
                  Сериализатор для загрузки аватара в мессенджере.

                  Наследует от AvatarModelSerializer, но с некоторыми изменениями валидации.
                properties:
                  file:
                    type: string
                    nullable: true
                  file_url:
                    type: string
                    readOnly: true
                  file_master_url:
                    type: string
                    nullable: true
                    readOnly: true
                    description: url-ссылка на защищенный endpoint оригинала аватара
                  file_webp_url:
                    type: string
                    readOnly: true
                  file_small_url:
                    type: string
                    readOnly: true
                required:
                - file_master_url
                - file_small_url
                - file_url
                - file_webp_url
              MessengerCreateCodePhone:
                type: object
                description: Запрашивает код подтверждения для мессенджера.
                properties:
                  phone_number:
                    type: string
                    description: номер телефона в формате E.164 (макс. 16 символов)
                    maxLength: 16
                required:
                - phone_number
              MessengerGetFromCodeToken:
                type: object
                description: Получить токен по коду, который пришел на телефон для мессенджера.
                properties:
                  phone_number:
                    type: string
                    writeOnly: true
                    description: номер телефона в формате E.164 (макс. 16 символов)
                    maxLength: 16
                  code:
                    type: string
                    writeOnly: true
                    description: 5-ти значный код, который пришёл на телефон
                    maxLength: 5
                    minLength: 5
                  access:
                    type: string
                    readOnly: true
                  refresh:
                    type: string
                    readOnly: true
                  is_filled:
                    type: boolean
                    readOnly: true
                    default: true
                required:
                - access
                - code
                - is_filled
                - phone_number
                - refresh
              MessengerProfileUser:
                type: object
                description: |-
                  Профиль пользователя для мессенджера.

                  Наследует от ProfileUserSerializer, но с некоторыми изменениями валидации.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    readOnly: true
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  first_name:
                    type: string
                    description: имя
                    pattern: ^[a-zA-Z\u0430-\u044f\u0410-\u042f\u0451\u0401 -]{2,30}$
                    maxLength: 30
                    minLength: 2
                  last_name:
                    type: string
                    description: фамилия
                    pattern: ^[a-zA-Z\u0430-\u044f\u0410-\u042f\u0451\u0401 -]{2,30}$
                    maxLength: 30
                    minLength: 2
                  patronymic:
                    type: string
                    description: отчество
                    minLength: 0
                  additional_information:
                    type: string
                    description: о себе
                    maxLength: 140
                    minLength: 1
                  birthday:
                    type: string
                    nullable: true
                    description: временная метка дня рождения в секундах
                  email:
                    type: string
                    format: email
                    description: e-mail
                  gender:
                    nullable: true
                    title: Пол
                    description: |-
                      пол (male - мужской, female - женский)

                      * `male` - Мужчина
                      * `female` - Женщина
                    oneOf:
                    - $ref: '#/components/schemas/GenderEnum'
                    - $ref: '#/components/schemas/BlankEnum'
                    - $ref: '#/components/schemas/NullEnum'
                  gender_label:
                    type: string
                    readOnly: true
                    description: пол
                  country:
                    allOf:
                    - $ref: '#/components/schemas/CountryEnum'
                    default: RU
                    description: |-
                      код страны

                      * `AF` - Afghanistan
                      * `AX` - Åland Islands
                      * `AL` - Albania
                      * `DZ` - Algeria
                      * `AS` - American Samoa
                      * `AD` - Andorra
                      * `AO` - Angola
                      * `AI` - Anguilla
                      * `AQ` - Antarctica
                      * `AG` - Antigua and Barbuda
                      * `AR` - Argentina
                      * `AM` - Armenia
                      * `AW` - Aruba
                      * `AU` - Australia
                      * `AT` - Austria
                      * `AZ` - Azerbaijan
                      * `BS` - Bahamas
                      * `BH` - Bahrain
                      * `BD` - Bangladesh
                      * `BB` - Barbados
                      * `BY` - Belarus
                      * `BE` - Belgium
                      * `BZ` - Belize
                      * `BJ` - Benin
                      * `BM` - Bermuda
                      * `BT` - Bhutan
                      * `BO` - Bolivia
                      * `BQ` - Bonaire, Sint Eustatius and Saba
                      * `BA` - Bosnia and Herzegovina
                      * `BW` - Botswana
                      * `BV` - Bouvet Island
                      * `BR` - Brazil
                      * `IO` - British Indian Ocean Territory
                      * `BN` - Brunei
                      * `BG` - Bulgaria
                      * `BF` - Burkina Faso
                      * `BI` - Burundi
                      * `CV` - Cabo Verde
                      * `KH` - Cambodia
                      * `CM` - Cameroon
                      * `CA` - Canada
                      * `KY` - Cayman Islands
                      * `CF` - Central African Republic
                      * `TD` - Chad
                      * `CL` - Chile
                      * `CN` - China
                      * `CX` - Christmas Island
                      * `CC` - Cocos (Keeling) Islands
                      * `CO` - Colombia
                      * `KM` - Comoros
                      * `CG` - Congo
                      * `CD` - Congo (the Democratic Republic of the)
                      * `CK` - Cook Islands
                      * `CR` - Costa Rica
                      * `CI` - Côte d'Ivoire
                      * `HR` - Croatia
                      * `CU` - Cuba
                      * `CW` - Curaçao
                      * `CY` - Cyprus
                      * `CZ` - Czechia
                      * `DK` - Denmark
                      * `DJ` - Djibouti
                      * `DM` - Dominica
                      * `DO` - Dominican Republic
                      * `EC` - Ecuador
                      * `EG` - Egypt
                      * `SV` - El Salvador
                      * `GQ` - Equatorial Guinea
                      * `ER` - Eritrea
                      * `EE` - Estonia
                      * `SZ` - Eswatini
                      * `ET` - Ethiopia
                      * `FK` - Falkland Islands (Malvinas)
                      * `FO` - Faroe Islands
                      * `FJ` - Fiji
                      * `FI` - Finland
                      * `FR` - France
                      * `GF` - French Guiana
                      * `PF` - French Polynesia
                      * `TF` - French Southern Territories
                      * `GA` - Gabon
                      * `GM` - Gambia
                      * `GE` - Georgia
                      * `DE` - Germany
                      * `GH` - Ghana
                      * `GI` - Gibraltar
                      * `GR` - Greece
                      * `GL` - Greenland
                      * `GD` - Grenada
                      * `GP` - Guadeloupe
                      * `GU` - Guam
                      * `GT` - Guatemala
                      * `GG` - Guernsey
                      * `GN` - Guinea
                      * `GW` - Guinea-Bissau
                      * `GY` - Guyana
                      * `HT` - Haiti
                      * `HM` - Heard Island and McDonald Islands
                      * `VA` - Holy See
                      * `HN` - Honduras
                      * `HK` - Hong Kong
                      * `HU` - Hungary
                      * `IS` - Iceland
                      * `IN` - India
                      * `ID` - Indonesia
                      * `IR` - Iran
                      * `IQ` - Iraq
                      * `IE` - Ireland
                      * `IM` - Isle of Man
                      * `IL` - Israel
                      * `IT` - Italy
                      * `JM` - Jamaica
                      * `JP` - Japan
                      * `JE` - Jersey
                      * `JO` - Jordan
                      * `KZ` - Kazakhstan
                      * `KE` - Kenya
                      * `KI` - Kiribati
                      * `KW` - Kuwait
                      * `KG` - Kyrgyzstan
                      * `LA` - Laos
                      * `LV` - Latvia
                      * `LB` - Lebanon
                      * `LS` - Lesotho
                      * `LR` - Liberia
                      * `LY` - Libya
                      * `LI` - Liechtenstein
                      * `LT` - Lithuania
                      * `LU` - Luxembourg
                      * `MO` - Macao
                      * `MG` - Madagascar
                      * `MW` - Malawi
                      * `MY` - Malaysia
                      * `MV` - Maldives
                      * `ML` - Mali
                      * `MT` - Malta
                      * `MH` - Marshall Islands
                      * `MQ` - Martinique
                      * `MR` - Mauritania
                      * `MU` - Mauritius
                      * `YT` - Mayotte
                      * `MX` - Mexico
                      * `FM` - Micronesia
                      * `MD` - Moldova
                      * `MC` - Monaco
                      * `MN` - Mongolia
                      * `ME` - Montenegro
                      * `MS` - Montserrat
                      * `MA` - Morocco
                      * `MZ` - Mozambique
                      * `MM` - Myanmar
                      * `NA` - Namibia
                      * `NR` - Nauru
                      * `NP` - Nepal
                      * `NL` - Netherlands
                      * `NC` - New Caledonia
                      * `NZ` - New Zealand
                      * `NI` - Nicaragua
                      * `NE` - Niger
                      * `NG` - Nigeria
                      * `NU` - Niue
                      * `NF` - Norfolk Island
                      * `KP` - North Korea
                      * `MK` - North Macedonia
                      * `MP` - Northern Mariana Islands
                      * `NO` - Norway
                      * `OM` - Oman
                      * `PK` - Pakistan
                      * `PW` - Palau
                      * `PS` - Palestine, State of
                      * `PA` - Panama
                      * `PG` - Papua New Guinea
                      * `PY` - Paraguay
                      * `PE` - Peru
                      * `PH` - Philippines
                      * `PN` - Pitcairn
                      * `PL` - Poland
                      * `PT` - Portugal
                      * `PR` - Puerto Rico
                      * `QA` - Qatar
                      * `RE` - Réunion
                      * `RO` - Romania
                      * `RU` - Russia
                      * `RW` - Rwanda
                      * `BL` - Saint Barthélemy
                      * `SH` - Saint Helena, Ascension and Tristan da Cunha
                      * `KN` - Saint Kitts and Nevis
                      * `LC` - Saint Lucia
                      * `MF` - Saint Martin (French part)
                      * `PM` - Saint Pierre and Miquelon
                      * `VC` - Saint Vincent and the Grenadines
                      * `WS` - Samoa
                      * `SM` - San Marino
                      * `ST` - Sao Tome and Principe
                      * `SA` - Saudi Arabia
                      * `SN` - Senegal
                      * `RS` - Serbia
                      * `SC` - Seychelles
                      * `SL` - Sierra Leone
                      * `SG` - Singapore
                      * `SX` - Sint Maarten (Dutch part)
                      * `SK` - Slovakia
                      * `SI` - Slovenia
                      * `SB` - Solomon Islands
                      * `SO` - Somalia
                      * `ZA` - South Africa
                      * `GS` - South Georgia and the South Sandwich Islands
                      * `KR` - South Korea
                      * `SS` - South Sudan
                      * `ES` - Spain
                      * `LK` - Sri Lanka
                      * `SD` - Sudan
                      * `SR` - Suriname
                      * `SJ` - Svalbard and Jan Mayen
                      * `SE` - Sweden
                      * `CH` - Switzerland
                      * `SY` - Syria
                      * `TW` - Taiwan
                      * `TJ` - Tajikistan
                      * `TZ` - Tanzania
                      * `TH` - Thailand
                      * `TL` - Timor-Leste
                      * `TG` - Togo
                      * `TK` - Tokelau
                      * `TO` - Tonga
                      * `TT` - Trinidad and Tobago
                      * `TN` - Tunisia
                      * `TR` - Türkiye
                      * `TM` - Turkmenistan
                      * `TC` - Turks and Caicos Islands
                      * `TV` - Tuvalu
                      * `UG` - Uganda
                      * `UA` - Ukraine
                      * `AE` - United Arab Emirates
                      * `GB` - United Kingdom
                      * `UM` - United States Minor Outlying Islands
                      * `US` - United States of America
                      * `UY` - Uruguay
                      * `UZ` - Uzbekistan
                      * `VU` - Vanuatu
                      * `VE` - Venezuela
                      * `VN` - Vietnam
                      * `VG` - Virgin Islands (British)
                      * `VI` - Virgin Islands (U.S.)
                      * `WF` - Wallis and Futuna
                      * `EH` - Western Sahara
                      * `YE` - Yemen
                      * `ZM` - Zambia
                      * `ZW` - Zimbabwe
                  country_label:
                    type: string
                    readOnly: true
                    description: страна
                  city_id:
                    type: integer
                    description: идентификатор города из справочника
                  city:
                    type: string
                    readOnly: true
                    description: объект город/регион
                  phone:
                    type: string
                    description: номер телефона в формате E.164 (макс. 16 символов)
                    maxLength: 16
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_filled:
                    type: boolean
                    readOnly: true
                    description: заполнен профиль
                  is_staff:
                    type: boolean
                    readOnly: true
                    description: статус модератора
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - city
                - country_label
                - gender_label
                - is_deleted
                - is_filled
                - is_staff
                - uid
                - username
              NullEnum:
                enum:
                - null
              PaginatedBlacklistList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Blacklist'
              PaginatedChatListList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatList'
              PaginatedContactReadByUidList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ContactReadByUid'
              PaginatedContactReadList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ContactRead'
              PaginatedContactSearchUserList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ContactSearchUser'
              PaginatedContactSuperShortUserList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ContactSuperShortUser'
              PaginatedContactUserList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/ContactUser'
              PaginatedDeviceTokenList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/DeviceToken'
              PaginatedGETMessageFileModelList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/GETMessageFileModel'
              PaginatedGroupChannelFileList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/GroupChannelFile'
              PaginatedGroupChannelParticipantList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/GroupChannelParticipant'
              PaginatedMessageLinkList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/MessageLink'
              PaginatedRESTMessageList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTMessage'
              PaginatedUserForAddList:
                type: object
                required:
                - count
                - results
                properties:
                  count:
                    type: integer
                    example: 123
                  next:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=4
                  previous:
                    type: string
                    nullable: true
                    format: uri
                    example: http://api.example.org/accounts/?page=2
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/UserForAdd'
              Participant:
                type: object
                description: Сериализатор элемента списка участников для отображения в Swagger.
                properties:
                  uid:
                    type: string
                    format: uuid
                  full_name:
                    type: string
                required:
                - full_name
                - uid
              PhoneOrNickname:
                type: object
                description: Сериализатор для поиска по телефону или никнейму.
                properties:
                  phone_or_nickname:
                    type: string
                    description: Телефон или никнейм
                required:
                - phone_or_nickname
              PlusofonPhoneAuthBlockedResponse:
                type: object
                description: Описывает ответ при блокировке номера телефона для нового start.
                properties:
                  message:
                    type: string
                    readOnly: true
                    description: Сообщение о временной блокировке номера телефона
                  blocked_until:
                    type: string
                    format: date-time
                    readOnly: true
                    description: Время окончания блокировки номера телефона
                  attempt_number:
                    type: integer
                    readOnly: true
                    description: Порядковый номер текущей попытки в окне блокировки
                  block_duration_seconds:
                    type: integer
                    readOnly: true
                    description: Оставшееся время блокировки в секундах
                  block_created_at:
                    type: number
                    format: double
                    readOnly: true
                    description: UNIX timestamp начала активной блокировки в секундах
                required:
                - attempt_number
                - block_created_at
                - block_duration_seconds
                - blocked_until
                - message
              PlusofonPhoneAuthClaimResponse:
                type: object
                description: Описывает JWT-ответ для claim endpoint-а auth-сессии.
                properties:
                  refresh:
                    type: string
                    readOnly: true
                  access:
                    type: string
                    readOnly: true
                  is_filled:
                    type: boolean
                    readOnly: true
                    description: Признак заполненности профиля для messenger auth-flow
                required:
                - access
                - is_filled
                - refresh
              PlusofonPhoneAuthConflictResponse:
                type: object
                description: Описывает ответ при дублирующем start активной auth-сессии.
                properties:
                  message:
                    type: string
                    readOnly: true
                    description: Сообщение о том, что auth-сессия уже активна
                required:
                - message
              PlusofonPhoneAuthSessionSecret:
                type: object
                description: Валидирует session secret для client-side polling и claim.
                properties:
                  session_secret:
                    type: string
                    description: Секретный ключ auth-сессии для клиента
                    maxLength: 255
                required:
                - session_secret
              PlusofonPhoneAuthStartRequest:
                type: object
                description: Валидирует запрос на старт Plusofon phone auth session.
                properties:
                  phone_number:
                    type: string
                    description: номер телефона в формате E.164 (макс. 16 символов)
                    maxLength: 16
                required:
                - phone_number
              PlusofonPhoneAuthStartResponse:
                type: object
                description: Описывает ответ со стартовыми данными Plusofon auth-session.
                properties:
                  session_uid:
                    type: string
                    format: uuid
                    readOnly: true
                    description: Уник-ый идентификатор auth-сессии для последующего опроса статуса
                  session_secret:
                    type: string
                    readOnly: true
                    description: Секретный ключ auth-сессии для клиента
                  call_number:
                    type: string
                    readOnly: true
                    description: Номер телефона для обратного звонка
                  expires_at:
                    type: string
                    format: date-time
                    readOnly: true
                    description: Время истечения срока действия auth-сессии
                  poll_interval_seconds:
                    type: integer
                    readOnly: true
                    description: Интервал опроса статуса auth-сессии в секундах
                  attempt_number:
                    type: integer
                    readOnly: true
                    description: Порядковый номер текущей попытки в окне блокировки
                  block_duration_seconds:
                    type: integer
                    readOnly: true
                    nullable: true
                    description: Оставшееся время активной блокировки в секундах
                  block_created_at:
                    type: number
                    format: double
                    readOnly: true
                    nullable: true
                    description: UNIX timestamp начала активной блокировки в секундах
                required:
                - attempt_number
                - block_created_at
                - block_duration_seconds
                - call_number
                - expires_at
                - poll_interval_seconds
                - session_secret
                - session_uid
              PlusofonPhoneAuthStatusResponse:
                type: object
                description: |-
                  Описывает ответ polling endpoint-а по auth-сессии.

                  Статусы:
                       - `pending` означает, что сессия еще не подтверждена webhook-ом от Plusofon,
                           ожидает звонок не более 2 минут и может быть повторно возвращена
                           через `start`, если исходный ответ не дошел до клиента
                       - `verified` означает, что webhook подтвердил сессию и она готова к claim
                           в течение 15 минут после верификации
                   - `consumed` означает, что claim уже был успешно выполнен и сессия использована
                   - `expired` означает, что сессия истекла и больше не может быть использована.
                properties:
                  session_uid:
                    type: string
                    format: uuid
                    readOnly: true
                    description: Уник-ый идентификатор auth-сессии
                  status:
                    type: string
                    readOnly: true
                    description: Статус auth-сессии
                  expires_at:
                    type: string
                    format: date-time
                    readOnly: true
                    description: Время истечения auth-сессии
                  verified_at:
                    type: string
                    format: date-time
                    readOnly: true
                    nullable: true
                    description: Время верификации телефона
                  consumed_at:
                    type: string
                    format: date-time
                    readOnly: true
                    nullable: true
                    description: Время использования auth-сессии
                  poll_interval_seconds:
                    type: integer
                    readOnly: true
                    description: Интервал опроса в секундах
                  is_claim_available:
                    type: boolean
                    readOnly: true
                    description: Доступность claim для auth-сессии
                required:
                - consumed_at
                - expires_at
                - is_claim_available
                - poll_interval_seconds
                - session_uid
                - status
                - verified_at
              RESTFlatForwardedMessage:
                type: object
                description: Сериализатор для пересланных сообщений в REST API.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                    description: автор удален
                  from_user:
                    type: string
                    readOnly: true
                    description: автор сообщения
                  first_name:
                    type: string
                    readOnly: true
                    description: имя автора пересылаемого сообщения
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия автора пересылаемого сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTMessageFile'
                    readOnly: true
                    description: список файлов
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение автора в формате WebP
                required:
                - avatar_webp_url
                - files_list
                - first_name
                - from_user
                - id
                - is_deleted
                - last_name
                - uid
              RESTFlatMessage:
                type: object
                description: Сериализатор для вложенных сообщений в REST API.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                    description: автор удален
                  from_user:
                    type: string
                    readOnly: true
                    description: автор сообщения
                  first_name:
                    type: string
                    readOnly: true
                    description: имя автора сообщения
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия автора сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTMessageFile'
                    readOnly: true
                    description: список файлов
                required:
                - files_list
                - first_name
                - from_user
                - id
                - is_deleted
                - last_name
                - uid
              RESTMessage:
                type: object
                description: Основной сериализатор сообщений для REST API.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/RESTShortUser'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/RESTShortUser'
                    readOnly: true
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  replied_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTFlatMessage'
                    readOnly: true
                    description: ответ на
                  forwarded_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTFlatForwardedMessage'
                    readOnly: true
                    description: пересылаемые сообщения
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/RESTMessageFile'
                    readOnly: true
                    description: список файлов
                  new:
                    type: boolean
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  chat_id:
                    type: integer
                    readOnly: true
                  chat_key:
                    type: string
                    readOnly: true
                  chat_type:
                    type: string
                    readOnly: true
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/ShortRTCModel'
                    nullable: true
                    readOnly: true
                    description: объект звонка привязанного к этому сообщению
                required:
                - chat_id
                - chat_key
                - chat_type
                - created_at
                - files_list
                - forwarded_messages
                - from_user
                - id
                - message_rtc
                - new
                - replied_messages
                - to_user
                - uid
                - updated_at
              RESTMessageFile:
                type: object
                description: Сериализатор файлов для REST API.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - created_at
                - download_name
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp_url
                - id
                - media_kind
                - uid
                - updated_at
              RESTShortUser:
                type: object
                description: Сериализатор пользователя для REST API сообщений.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    title: Имя пользователя
                    description: имя пользователя
                    maxLength: 250
                  nickname:
                    type: string
                    title: Nick Name
                    pattern: ^[a-z0-9._]{6,32}$
                    maxLength: 32
                  first_name:
                    type: string
                    readOnly: true
                    description: имя
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                required:
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp_url
                - first_name
                - is_deleted
                - last_name
                - nickname
                - uid
                - username
              ReasonCodeEnum:
                enum:
                - connection_timeout
                - ice_failed
                - peer_connection_failed
                - local_media_error
                - signaling_error
                - unknown_error
                type: string
                description: |-
                  * `connection_timeout` - connection_timeout
                  * `ice_failed` - ice_failed
                  * `peer_connection_failed` - peer_connection_failed
                  * `local_media_error` - local_media_error
                  * `signaling_error` - signaling_error
                  * `unknown_error` - unknown_error
              RemoveMembersFromChatObjectSerializer:
                type: object
                description: Сериализатор для object-поля при удалении участников из чата.
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата
                  chat_type:
                    type: string
                    description: Тип чата
                  remove_users:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatParticipantSerializer'
                    description: Список удаленных пользователей
                required:
                - chat_key
                - chat_type
                - remove_users
              SFUTokenRequest:
                type: object
                description: |-
                  Сериализатор входящего запроса для получения SFU токена.

                  Ожидает поле:
                  {
                      "chat_key": "group_74c6441b-c6f3-45bf-b0c0-5d08c9685936"
                  }
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор группового чата (Chat.chat_key)
                required:
                - chat_key
              SFUTokenResponse:
                type: object
                description: |-
                  Сериализатор ответа при выдаче SFU токена.

                  Формат ответа:
                  {
                      "token": "строка JWT",
                      "expires_in": 120
                  }
                properties:
                  token:
                    type: string
                    description: Короткоживущий SFU JWT
                  expires_in:
                    type: integer
                    description: Время жизни токена в секундах
                required:
                - expires_in
                - token
              SearchMessage:
                type: object
                description: Сериализатор для поиска сообщений.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  page:
                    type: integer
                    readOnly: true
                    description: страница на которой находится сообщение
                  position:
                    type: integer
                    readOnly: true
                    description: номер сообщения на странице
                  field:
                    allOf:
                    - $ref: '#/components/schemas/FieldEnum'
                    writeOnly: true
                    description: |-
                      Поле для поиска

                      * `id_or_uid` - id_or_uid
                      * `content` - content
                  query:
                    type: string
                    writeOnly: true
                    description: Поисковый запрос
                    maxLength: 4096
                  chat_page_size:
                    type: integer
                    minimum: 1
                    writeOnly: true
                    description: Размер страницы для вычисления позиции
                required:
                - field
                - id
                - page
                - position
                - query
                - uid
              SerializeRequestGetStatusListChat:
                type: object
                description: |-
                  Сериализатор для запроса на получение статуса списка чата.

                  {
                      'action': 'get_status_list_chat',
                      'request_uid': '3fa85f64-5717-4562-b3fc-2c963f66afa6'
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action1dfEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                required:
                - action
              SerializerAvatarMessage:
                type: object
                description: |-
                  Сериализатор для передачи аватара в WebSocket сообщениях (группы/профиля).

                  Позволяет передать либо base64 данные, либо UID временно загруженного файла.
                properties:
                  filename:
                    type: string
                    description: Имя файла с расширением
                  data:
                    type: string
                    description: Содержимое файла в формате Base64
                  uid:
                    type: string
                    format: uuid
                    nullable: true
                    description: Идентификатор временно загруженного аватара (UID)
              SerializerFileMessage:
                type: object
                description: |-
                  Сериализатор для передачи файлов в WebSocket сообщениях.

                  Формат данных:
                  {
                      'data': 'base64-encoded-file-content',
                      'filename': 'document.pdf'
                  }
                properties:
                  filename:
                    type: string
                    default: document.pdf
                    description: Имя файла с расширением
                  data:
                    type: string
                    default: UERGLTEuNCBmaWxlIGNvbnRlbnQ=
                    description: Содержимое файла в формате Base64
              SerializerMessageWebRTC:
                type: object
                description: Сериализатор для модели MessageRTC.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    $ref: '#/components/schemas/SerializerUserForMessageWebRTC'
                  to_user:
                    $ref: '#/components/schemas/SerializerUserForMessageWebRTC'
                  duration:
                    type: integer
                    maximum: 2147483647
                    minimum: -2147483648
                    nullable: true
                    title: Продолжительность звонка
                  status:
                    allOf:
                    - $ref: '#/components/schemas/Status941Enum'
                    title: Статус звонка
                  answered_at:
                    type: string
                    format: date-time
                    nullable: true
                    title: Время подтверждения звонка
                  connected_at:
                    type: string
                    format: date-time
                    nullable: true
                    title: Время установления соединения
                  reason_code:
                    type: string
                    title: Причина технического завершения звонка
                    maxLength: 64
                  updated_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время обновления
                  created_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время создания
                required:
                - created_at
                - from_user
                - to_user
                - uid
                - updated_at
              SerializerMessageWebRTCOffer:
                type: object
                description: Сериализатор стартового ответа offer_call без технических полей
                  прогресса.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    $ref: '#/components/schemas/SerializerUserForMessageWebRTC'
                  to_user:
                    $ref: '#/components/schemas/SerializerUserForMessageWebRTC'
                  duration:
                    type: integer
                    maximum: 2147483647
                    minimum: -2147483648
                    nullable: true
                    title: Продолжительность звонка
                  status:
                    allOf:
                    - $ref: '#/components/schemas/Status941Enum'
                    title: Статус звонка
                  updated_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время обновления
                  created_at:
                    type: string
                    format: date-time
                    readOnly: true
                    title: Время создания
                required:
                - created_at
                - from_user
                - to_user
                - uid
                - updated_at
              SerializerRequestAddMembersToChat:
                type: object
                description: |-
                  Сериализатор для добавления участников в чат.

                  {
                      'action': 'add_members_to_chat',
                      'object': SerializerObjectCreateMessage
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/ActionE09Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectAddMembersToChat'
                required:
                - action
                - object
              SerializerRequestCallAnswer:
                type: object
                description: |-
                  Сериализатор запроса на получение answer.

                  {
                      'action': 'answer_call',
                      'request_uid': UUID,
                      'object': SerializerRequestObjectAnswer
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action5caEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectAnswer'
                required:
                - action
                - object
              SerializerRequestCallComplete:
                type: object
                description: |-
                  Сериализатор завершения звонка.

                  {
                      'action': 'call_completion',
                      'request_uid': UUID,
                      'object': SerializerRequestObjectCallComplete
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action4d4Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectCallComplete'
                required:
                - action
                - object
              SerializerRequestCallOffer:
                type: object
                description: |-
                  Сериализатор запроса на получение offer.

                  {
                      'action': 'offer_call',
                      'request_uid': UUID,
                      'object': SerializerRequestObjectOffer
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action433Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectOffer'
                required:
                - action
                - object
              SerializerRequestCallStateUpdate:
                type: object
                description: Сериализатор запроса на обновление технического состояния звонка.
                properties:
                  action:
                    $ref: '#/components/schemas/Action267Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectCallStateUpdate'
                required:
                - action
                - object
              SerializerRequestChangeStatusReadMessage:
                type: object
                description: |-
                  Сериализатор для запроса на изменение статуса о прочтении сообщения.

                  {
                      'action': 'change_status_read_message',
                      'object': SerializerObjectChangeStatusReadMessage
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action477Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectChangeStatusReadMessage'
                required:
                - action
                - object
              SerializerRequestClearGroupMessages:
                type: object
                description: Запрос на очистку всех сообщений группы/канала.
                properties:
                  action:
                    $ref: '#/components/schemas/ActionA6bEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: Уникальный идентификатор запроса (UUID)
                  object:
                    $ref: '#/components/schemas/ClearGroupMessagesObjectSerializer'
                required:
                - action
                - object
              SerializerRequestCreateChat:
                type: object
                description: |-
                  Сериализатор для создания чата или канала.

                  {
                      'action': 'create_chat',
                      'object': SerializerObjectCreateMessage
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action472Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectCreateChatMessage'
                required:
                - action
                - object
              SerializerRequestCreatingMessage:
                type: object
                description: |-
                  Сериализатор для запроса на создание сообщения.

                  {
                      'action': 'create_text_message',
                      'object': SerializerObjectCreateMessage
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/SerializerRequestCreatingMessageActionEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectCreateMessage'
                required:
                - action
                - object
              SerializerRequestCreatingMessageActionEnum:
                enum:
                - create_text_message
                type: string
                description: '* `create_text_message` - create_text_message'
              SerializerRequestDeleteChat:
                type: object
                description: |-
                  Сериализатор для удаления чата или канала.

                  {
                      'action': 'delete_chat',
                      'object': SerializerRequestObjectDeleteChat
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action40eEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectDeleteChat'
                required:
                - action
                - object
              SerializerRequestDeleteMessage:
                type: object
                description: |-
                  Сериализатор для запроса на удаление сообщения.

                  {
                      'action': 'delete_message',
                      'object': SerializerObjectDeleteMessage
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/ActionA7fEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectDeleteMessage'
                required:
                - action
                - object
              SerializerRequestEditChat:
                type: object
                description: |-
                  Сериализатор для редактирования чата/канала.

                  {
                      'action': 'edit_chat',
                      'object': SerializerRequestObjectEditChat
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action078Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectEditChat'
                required:
                - action
                - object
              SerializerRequestICECandidate:
                type: object
                description: |-
                  Сериализатор запроса на получение ICE кандидатов.

                  {
                      'action': 'ice_candidate',
                      'request_uid': UUID,
                      'object': SerializerRequestObjectICECandidate
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/ActionF3cEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectICECandidate'
                required:
                - action
                - object
              SerializerRequestJoinByInviteLink:
                type: object
                description: |-
                  Сериализатор для запроса на присоединение к чату по пригласительной ссылке.

                  {
                      'action': 'join_by_invite_link',
                      'object': SerializerRequestObjectJoinByInviteLink
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/ActionD1dEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectJoinByInviteLink'
                required:
                - action
                - object
              SerializerRequestLeaveChat:
                type: object
                description: |-
                  Формат запроса на выход из группы/канала.

                  {
                      'action': 'leave_chat',
                      'request_uid': 'uuid-запроса',
                      'object': SerializerRequestObjectLeaveChat
                  }
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action926Enum'
                    description: |-
                      Тип действия

                      * `leave_chat` - leave_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: UID запроса
                  object:
                    allOf:
                    - $ref: '#/components/schemas/SerializerRequestObjectLeaveChat'
                    description: Данные для выхода из чата
                required:
                - action
                - object
              SerializerRequestObjectAddMembersToChat:
                type: object
                description: |-
                  Добавление пользователей в чат.

                  {
                      'chat_key': идентификатор чата,
                      'uid_users_list': список идентификаторов пользователей (UUID)
                              Пример: ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
                  }
                properties:
                  chat_key:
                    type: string
                    description: идентификатор чата
                  uid_users_list:
                    type: array
                    items: {}
                    writeOnly: true
                    description: список идентификаторов пользователей
                required:
                - chat_key
              SerializerRequestObjectAnswer:
                type: object
                description: Сериализатор тела ответа запроса answer для звонка.
                properties:
                  from_user_uid:
                    type: string
                    description: Идентификатор пользователя от которого направлен звонок
                  to_user_uid:
                    type: string
                    description: Идентификатор пользователя к которому направлен звонок
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: Идентификатор звонка для подтверждения конкретной сессии.
                  answer_sdp:
                    type: string
                    description: answer подтвердившего звонок, SDP в виде строки
                required:
                - answer_sdp
                - from_user_uid
                - message_rtc_uid
                - to_user_uid
              SerializerRequestObjectCallComplete:
                type: object
                description: Сериализатор тела ответа завершения звонка.
                properties:
                  from_user_uid:
                    type: string
                    description: Идентификатор пользователя от которого направлен звонок
                  to_user_uid:
                    type: string
                    description: Идентификатор пользователя к которому направлен звонок
                  type_complete:
                    allOf:
                    - $ref: '#/components/schemas/TypeCompleteEnum'
                    description: |-
                      type завершения звонка

                      * `unreceived` - unreceived
                      * `rejected` - rejected
                      * `completed` - completed
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: Идентификатор сообщения звонка о его состоянии.
                  duration:
                    type: integer
                    nullable: true
                    description: Длительность звонка в секундах, если доступна
                required:
                - from_user_uid
                - message_rtc_uid
                - to_user_uid
                - type_complete
              SerializerRequestObjectCallStateUpdate:
                type: object
                description: Сериализатор технического состояния установления звонка.
                properties:
                  from_user_uid:
                    type: string
                    description: Идентификатор пользователя от которого направлен звонок
                  to_user_uid:
                    type: string
                    description: Идентификатор пользователя к которому направлен звонок
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: Идентификатор звонка для обновления технического состояния.
                  state:
                    allOf:
                    - $ref: '#/components/schemas/SerializerRequestObjectCallStateUpdateStateEnum'
                    description: |-
                      Техническое состояние звонка после обновления со стороны клиента

                      * `connected` - connected
                      * `failed` - failed
                  reason_code:
                    nullable: true
                    description: |-
                      Код причины технической ошибки, если state=failed

                      * `connection_timeout` - connection_timeout
                      * `ice_failed` - ice_failed
                      * `peer_connection_failed` - peer_connection_failed
                      * `local_media_error` - local_media_error
                      * `signaling_error` - signaling_error
                      * `unknown_error` - unknown_error
                    oneOf:
                    - $ref: '#/components/schemas/ReasonCodeEnum'
                    - $ref: '#/components/schemas/NullEnum'
                required:
                - from_user_uid
                - message_rtc_uid
                - state
                - to_user_uid
              SerializerRequestObjectCallStateUpdateStateEnum:
                enum:
                - connected
                - failed
                type: string
                description: |-
                  * `connected` - connected
                  * `failed` - failed
              SerializerRequestObjectChangeStatusReadMessage:
                type: object
                description: |-
                  Изменение статуса о прочтении.

                  {
                      'uid': идентификатор сообщения,
                      'new_read_status': новый статус о прочтении,
                      'chat_key': код главного чата / канала
                  }
                properties:
                  uid:
                    type: string
                    description: Идентификатор сообщения (UUID)
                  reader_uid:
                    type: string
                    nullable: true
                    description: UID пользователя который читает сообщение
                  new_read_status:
                    type: boolean
                    description: новый статус о прочтении
                  chat_key:
                    type: string
                    description: код главного чата / канала
                required:
                - uid
              SerializerRequestObjectCreateChatMessage:
                type: object
                description: |-
                  Создание группы или канала.

                  {
                      'name': Наименование группы/канала
                      'description': Описание группы/канала
                      'avatar': аватар группы/канала
                                (минимум 320x320px, форматы JPEG/PNG/BMP, до 5МБ)
                      'chat_type':
                          'public-group': открытая группа
                          'private-group': закрытая группа
                          'public-channel': публичный канал
                          'private-channel': частный канал
                      'uid_users_list': список идентификаторов пользователей
                              Пример: ["3fa85f64-5717-4562-b3fc-2c963f66afa6",]
                  }
                properties:
                  chat_key:
                    type: string
                    readOnly: true
                    description: идентификатор чата
                  name:
                    type: string
                    description: название группы/канала
                    maxLength: 100
                    minLength: 1
                  description:
                    type: string
                    description: описание группы/канала
                    maxLength: 250
                  avatar:
                    allOf:
                    - $ref: '#/components/schemas/SerializerAvatarMessage'
                    nullable: true
                    description: аватар группы/канала (минимум 320x320px, форматы JPEG/PNG/BMP,
                      до 5МБ)
                  avatar_uid:
                    type: string
                    format: uuid
                    nullable: true
                    description: UID временно загруженного аватара группы/канала
                  chat_type:
                    allOf:
                    - $ref: '#/components/schemas/SerializerRequestObjectCreateChatMessageChatTypeEnum'
                    description: |-
                      тип чата

                      * `public-group` - Открытая группа
                      * `private-group` - Закрытая группа
                      * `public-channel` - Публичный канал
                      * `private-channel` - Частный канал
                  uid_users_list:
                    type: array
                    items: {}
                    writeOnly: true
                    description: список идентификаторов пользователей
                required:
                - chat_key
                - chat_type
                - name
              SerializerRequestObjectCreateChatMessageChatTypeEnum:
                enum:
                - public-group
                - private-group
                - public-channel
                - private-channel
                type: string
                description: |-
                  * `public-group` - Открытая группа
                  * `private-group` - Закрытая группа
                  * `public-channel` - Публичный канал
                  * `private-channel` - Частный канал
              SerializerRequestObjectCreateMessage:
                type: object
                description: Сериализатор для запроса на создание сообщения.
                properties:
                  to_user_uid:
                    type: string
                    description: uid - идентификатор получателя
                  chat_key:
                    type: string
                    description: код главного чата / канала
                  content:
                    type: string
                    description: сообщения
                  status:
                    $ref: '#/components/schemas/Status1e9Enum'
                  files:
                    type: array
                    items:
                      $ref: '#/components/schemas/SerializerFileMessage'
                    description: Список файлов (не более 10)
                  message_attachment_uids:
                    type: array
                    items:
                      type: string
                    description: UID вложений, загруженных до отправки сообщения
                  replied_messages:
                    type: array
                    items: {}
                    description: ответ на
                  forwarded_messages:
                    type: array
                    items: {}
                    description: пересылаемые сообщения
              SerializerRequestObjectDeleteChat:
                type: object
                description: |-
                  Удаление чата или канала.

                  {
                      'chat_key': идентификатор чата/канала
                  }
                properties:
                  chat_key:
                    type: string
                    description: идентификатор канала для изменения
                required:
                - chat_key
              SerializerRequestObjectDeleteMessage:
                type: object
                description: |-
                  Удаление сообщения.

                  {
                  'uid': идентификатор сообщения,
                  'for_all': удаление для всех (true/false),
                  'chat_key': код главного чата / канала
                  }
                properties:
                  uid:
                    type: string
                    description: Идентификатор сообщения (UUID)
                  for_all:
                    type: boolean
                    description: удаление для всех
                  chat_key:
                    type: string
                    description: код главного чата / канала
                required:
                - uid
              SerializerRequestObjectEditChat:
                type: object
                description: |-
                  Сериализатор для редактирования чата/канала.

                  {
                      'chat_key': идентификатор чата (обязательно)
                      'name': новое наименование (опционально)
                      'description': новое описание (опционально)
                      'avatar': новый аватар (опционально)
                      'chat_type': новый тип чата (опционально)
                  }
                properties:
                  chat_key:
                    type: string
                    description: идентификатор чата для редактирования
                  name:
                    type: string
                    description: название группы/канала
                    maxLength: 100
                    minLength: 1
                  description:
                    type: string
                    description: описание группы/канала
                    maxLength: 250
                  avatar:
                    allOf:
                    - $ref: '#/components/schemas/SerializerAvatarMessage'
                    nullable: true
                    description: новый аватар чата (минимум 320x320px, форматы JPEG/PNG/BMP,
                      до 5МБ, поле filename — опционально)
                  avatar_uid:
                    type: string
                    format: uuid
                    nullable: true
                    description: UID временно загруженного аватара группы/канала
                  chat_type:
                    allOf:
                    - $ref: '#/components/schemas/ChatType5a4Enum'
                    description: |-
                      новый тип чата

                      * `chat` - личный
                      * `public-group` - открытая группа
                      * `private-group` - закрытая группа
                      * `public-channel` - публичный канал
                      * `private-channel` - частный канал
                required:
                - chat_key
                - name
              SerializerRequestObjectICECandidate:
                type: object
                description: Сериализатор тела ответа запроса ICE candidate для звонка.
                properties:
                  from_user_uid:
                    type: string
                    description: Идентификатор пользователя от которого направлен звонок
                  to_user_uid:
                    type: string
                    description: Идентификатор пользователя к которому направлен звонок
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: Идентификатор звонка, к которому относится ICE candidate.
                  ice_candidate:
                    type: string
                    description: ICE candidate пользователя, устанавливающего канал для звонка.
                required:
                - from_user_uid
                - ice_candidate
                - message_rtc_uid
                - to_user_uid
              SerializerRequestObjectJoinByInviteLink:
                type: object
                description: |-
                  Сериализатор для присоединения к чату по пригласительной ссылке.

                  {
                      'chat_key': идентификатор чата/канала,
                      'token': токен из пригласительной ссылки
                  }
                properties:
                  chat_key:
                    type: string
                  token:
                    type: string
                    description: токен из пригласительной ссылки
                required:
                - chat_key
                - token
              SerializerRequestObjectLeaveChat:
                type: object
                description: |-
                  Сериализатор для выхода из группы/канала.

                  {
                      'chat_key': идентификатор чата/канала (обязательно)
                  }
                properties:
                  chat_key:
                    type: string
                    description: Уникальный ключ чата/канала
                required:
                - chat_key
              SerializerRequestObjectOffer:
                type: object
                description: Сериализатор тела ответа запроса offer для звонка.
                properties:
                  to_user_uid:
                    type: string
                    description: Идентификатор пользователя к которому направлен звонок
                  offer_sdp:
                    type: string
                    description: offer инициатора звонка, SDP в виде строки
                required:
                - offer_sdp
                - to_user_uid
              SerializerRequestObjectRemoveMembersFromChat:
                type: object
                description: |-
                  Сериализатор для удаления пользователей из чата.

                  {
                      'chat_key': идентификатор чата (обязательно),
                      'uid_users_list': список ID пользователей [1,2,3] (обязательно)
                  }
                properties:
                  chat_key:
                    type: string
                    description: идентификатор чата
                  uid_users_list:
                    type: array
                    items: {}
                    description: список идентификаторов пользователей
                required:
                - chat_key
                - uid_users_list
              SerializerRequestObjectSelfJoin:
                type: object
                description: |-
                  Сериализатор для присоединения к чату самим пользователем.

                  {
                      'chat_key': идентификатор чата/канала
                  }
                properties:
                  chat_key:
                    type: string
                required:
                - chat_key
              SerializerRequestObjectTransferOwner:
                type: object
                description: |-
                  Сериализатор для object-поля при передаче прав владельца чата.

                  {
                      'chat_key': идентификатор чата,
                      'new_owner_uid': uid нового владельца
                  }
                properties:
                  chat_key:
                    type: string
                    description: идентификатор чата
                  new_owner_uid:
                    type: string
                    format: uuid
                    description: uid нового владельца
                required:
                - chat_key
                - new_owner_uid
              SerializerRequestObjectUpdatingMessage:
                type: object
                description: |-
                  Сериализатор для обновления существующего сообщения в чате.

                  Формат запроса:
                  {
                      'chat_key': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      'uid': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      'files': [
                          {
                              'data': 'base64-encoded-content',
                              'filename': 'document.pdf'
                          }
                      ],
                      'message_attachment_uids': [
                          'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                      ],
                      'content': 'Обновленный текст сообщения',
                      'status': 'publish'
                  }
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  uid:
                    type: string
                    description: Идентификатор сообщения (UUID)
                  content:
                    type: string
                    description: Новый текст сообщения
                  status:
                    allOf:
                    - $ref: '#/components/schemas/Status1e9Enum'
                    description: |-
                      Статус сообщения: опубликовано (publish) или черновик (draft)

                      * `publish` - publish
                      * `draft` - draft
                  files:
                    type: array
                    items:
                      $ref: '#/components/schemas/SerializerFileMessage'
                    description: Новый список файлов для сообщения
                  message_attachment_uids:
                    type: array
                    items:
                      type: string
                    description: UID заранее загруженных вложений для замены файлов сообщения
                required:
                - chat_key
                - uid
              SerializerRequestRemoveMembersFromChat:
                type: object
                description: |-
                  Сериализатор для удаления участников из чата.

                  {
                      'action': 'remove_members_from_chat',
                      'object': SerializerRequestObjectRemoveMembersFromChat
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action0cdEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectRemoveMembersFromChat'
                required:
                - action
                - object
              SerializerRequestSelfJoin:
                type: object
                description: |-
                  Сериализатор для запроса на присоединение к чату самим пользователем.

                  {
                      'action': 'self_join_chat',
                      'object': SerializerRequestObjectSelfJoin
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/SerializerRequestSelfJoinActionEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectSelfJoin'
                required:
                - action
                - object
              SerializerRequestSelfJoinActionEnum:
                enum:
                - self_join_chat
                type: string
                description: '* `self_join_chat` - self_join_chat'
              SerializerRequestTransferOwner:
                type: object
                description: |-
                  Сериализатор запроса на передачу прав владельца чата.

                  {
                      'action': 'transfer_owner',
                      'request_uid': uuid-запроса,
                      'object': {
                          'chat_key': идентификатор чата,
                          'new_owner_uid': uid нового владельца
                      }
                  }
                properties:
                  action:
                    $ref: '#/components/schemas/Action8adEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: Уникальный идентификатор запроса
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectTransferOwner'
                required:
                - action
                - object
              SerializerRequestUpdatingMessage:
                type: object
                description: |-
                  Сериализатор для запроса на обновление сообщения.

                  {
                          'action': 'update_message',
                          'object': {
                              'uid': 'идентификатор сообщения (UUID)',
                              'files':[
                                  {
                                  'data':'base64-file',
                                  'filename':'filename.ext',
                                  },
                                  {
                                  'data':'base64-file',
                                  'filename':'filename.ext',
                                  },
                              ]
                              'content': 'сообщение',
                              'status':'publish/draft'
                          }
                      }
                properties:
                  action:
                    $ref: '#/components/schemas/ActionBebEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  object:
                    $ref: '#/components/schemas/SerializerRequestObjectUpdatingMessage'
                required:
                - action
                - object
              SerializerResponseAddMembersToChat:
                type: object
                description: |-
                  Сериализатор ответа для добавления участников в чат.

                  Наследует стандартную структуру BaseWebSocketObjectResponse:
                  {
                      'action': 'add_members_to_chat',
                      'request_uid': 'uuid-запроса',
                      'status': 'OK' или 'error',
                      'error': null или 'текст ошибки',
                      'object': {данные чата с новыми участниками}
                  }
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/ActionE09Enum'
                    default: add_members_to_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/SerializerResponseObjectAddMembersToChat'
                required:
                - object
              SerializerResponseAnswerForSwagger:
                type: object
                description: Сериализатор для ответа на ответ звонка.
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/Action5caEnum'
                  object:
                    $ref: '#/components/schemas/SerializerResponseCallAnswer'
                required:
                - action
                - error
                - object
              SerializerResponseCallAnswer:
                type: object
                description: Сериализатор для ответа запроса с answer.
                properties:
                  from_user:
                    type: string
                    format: uuid
                  to_user:
                    type: string
                    format: uuid
                  answer_sdp:
                    type: string
                    description: SDP answer в виде строки
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: uid - сообщения WebRTC для которого дан answer
                  call_state:
                    allOf:
                    - $ref: '#/components/schemas/CallStateEnum'
                    description: |-
                      Техническое состояние звонка после ответа

                      * `answered` - answered
                      * `connecting` - connecting
                      * `connected` - connected
                      * `failed` - failed
                required:
                - answer_sdp
                - call_state
                - from_user
                - message_rtc_uid
                - to_user
              SerializerResponseCallComplete:
                type: object
                description: Сериализатор для ответа прекращения звонка.
                properties:
                  from_user:
                    type: string
                    format: uuid
                  to_user:
                    type: string
                    format: uuid
                  type_complete:
                    type: string
                    description: type завершения звонка
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/SerializerMessageWebRTC'
                    description: Сообщение WebRTC
                  message_uid:
                    type: string
                    format: uuid
                    nullable: true
                    description: uid связанного текстового сообщения в чате
                required:
                - from_user
                - message_rtc
                - to_user
                - type_complete
              SerializerResponseCallCompleteForSwagger:
                type: object
                description: Сериализатор для ответа на завершение звонка.
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/Action4d4Enum'
                  object:
                    $ref: '#/components/schemas/SerializerResponseCallComplete'
                required:
                - action
                - error
                - object
              SerializerResponseCallOffer:
                type: object
                description: Сериализатор для ответа запроса с offer.
                properties:
                  from_user:
                    type: string
                    format: uuid
                  to_user:
                    type: string
                    format: uuid
                  offer_sdp:
                    type: string
                    description: SDP offer в виде строки
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/SerializerMessageWebRTCOffer'
                    description: Сообщение WebRTC
                  message_uid:
                    type: string
                    format: uuid
                    nullable: true
                    description: uid - связанного текстового сообщения в чате
                required:
                - from_user
                - message_rtc
                - offer_sdp
                - to_user
              SerializerResponseCallStateUpdate:
                type: object
                description: Сериализатор ответа на обновление технического состояния звонка.
                properties:
                  from_user:
                    type: string
                    format: uuid
                  to_user:
                    type: string
                    format: uuid
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: Идентификатор звонка для обновления технического состояния.
                  state:
                    allOf:
                    - $ref: '#/components/schemas/SerializerResponseCallStateUpdateStateEnum'
                    description: |-
                      Техническое состояние звонка после обновления

                      * `connecting` - connecting
                      * `connected` - connected
                      * `failed` - failed
                  reason_code:
                    nullable: true
                    description: |-
                      Код причины технической ошибки, если state=failed

                      * `connection_timeout` - connection_timeout
                      * `ice_failed` - ice_failed
                      * `peer_connection_failed` - peer_connection_failed
                      * `local_media_error` - local_media_error
                      * `signaling_error` - signaling_error
                      * `unknown_error` - unknown_error
                    oneOf:
                    - $ref: '#/components/schemas/ReasonCodeEnum'
                    - $ref: '#/components/schemas/NullEnum'
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/SerializerMessageWebRTC'
                    description: Сообщение WebRTC
                required:
                - from_user
                - message_rtc
                - message_rtc_uid
                - state
                - to_user
              SerializerResponseCallStateUpdateForSwagger:
                type: object
                description: Сериализатор для ответа на обновление состояния звонка.
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/Action267Enum'
                  object:
                    $ref: '#/components/schemas/SerializerResponseCallStateUpdate'
                required:
                - action
                - error
                - object
              SerializerResponseCallStateUpdateStateEnum:
                enum:
                - connecting
                - connected
                - failed
                type: string
                description: |-
                  * `connecting` - connecting
                  * `connected` - connected
                  * `failed` - failed
              SerializerResponseChangeStatusReadMessage:
                type: object
                description: Сериализатор для ответа на изменение статуса о прочтении сообщения.
                properties:
                  action:
                    $ref: '#/components/schemas/Action477Enum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    $ref: '#/components/schemas/StatusF1eEnum'
                  error:
                    type: string
                    description: Описание ошибки
                  object:
                    $ref: '#/components/schemas/SerializerResponseMessageReadStatus'
                required:
                - action
                - object
                - request_uid
                - status
              SerializerResponseClearGroupMessages:
                type: object
                description: Ответ на очистку всех сообщений группы/канала.
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/ActionA6bEnum'
                    default: clear_group_messages
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/ClearGroupMessagesResponseObjectSerializer'
                required:
                - object
              SerializerResponseCreateChat:
                type: object
                description: |-
                  Сериализатор ответа для создания чата.

                  Наследует стандартную структуру BaseWebSocketObjectResponse:
                  {
                      'action': 'create_chat',
                      'request_uid': 'uuid-запроса',
                      'status': 'OK' или 'error',
                      'error': null или 'текст ошибки',
                      'object': SerializerResponseObjectCreateChatMessage
                  }
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action472Enum'
                    default: create_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/SerializerResponseObjectCreateChatMessage'
                required:
                - object
              SerializerResponseDeleteChat:
                type: object
                description: Сериализатор для удаления группы/канала.
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action40eEnum'
                    default: delete_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/ChatObjectSerializer'
                required:
                - object
              SerializerResponseDeleteMessage:
                type: object
                description: Сериализатор для ответа на удаление сообщения.
                properties:
                  action:
                    $ref: '#/components/schemas/ActionA7fEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    $ref: '#/components/schemas/StatusF1eEnum'
                  error:
                    type: string
                    description: Описание ошибки
                  object:
                    $ref: '#/components/schemas/SerializerResponseMessageDelete'
                required:
                - action
                - object
                - request_uid
                - status
              SerializerResponseEditChat:
                type: object
                description: |-
                  Сериализатор ответа для редактирования чата.

                  Наследует стандартную структуру BaseWebSocketObjectResponse:
                  {
                      'action': 'edit_chat',
                      'request_uid': 'uuid-запроса',
                      'status': 'OK' или 'error',
                      'error': null или 'текст ошибки',
                      'object': {данные отредактированного чата}
                  }

                  TODO(legacy): после полного перехода клиентов на avatar_uid удалить
                  legacy-контракт avatar={filename,url} из этого сериализатора и оставить
                  только avatar_webp_url/avatar_small_url/avatar_master_url.
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action078Enum'
                    default: edit_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/SerializerResponseObjectCreateChatMessage'
                required:
                - object
              SerializerResponseGetStatusListChat:
                type: object
                description: Сериализатор для ответа на запрос статуса списка чата.
                properties:
                  action:
                    $ref: '#/components/schemas/Action1dfEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    $ref: '#/components/schemas/StatusF1eEnum'
                  error:
                    type: string
                    description: Описание ошибки
                  object:
                    allOf:
                    - $ref: '#/components/schemas/WSSuperShortUserSerializer'
                    description: чат
                required:
                - action
                - object
                - request_uid
                - status
              SerializerResponseICECandidate:
                type: object
                description: Сериализатор для ответа запроса с answer.
                properties:
                  from_user:
                    type: string
                    format: uuid
                  to_user:
                    type: string
                    format: uuid
                  message_rtc_uid:
                    type: string
                    format: uuid
                    description: uid - сообщения WebRTC, к которому относится ICE кандидат
                  uid_user_owner_candidate:
                    type: string
                    description: uid пользователя, чей кандидат передается
                  ice_candidate:
                    type: string
                    description: ICE кандидат в виде строки
                required:
                - from_user
                - ice_candidate
                - message_rtc_uid
                - to_user
                - uid_user_owner_candidate
              SerializerResponseICECandidateForSwagger:
                type: object
                description: Сериализатор для ответа на ICE кандидата.
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/ActionF3cEnum'
                  object:
                    $ref: '#/components/schemas/SerializerResponseICECandidate'
                required:
                - action
                - error
                - object
              SerializerResponseJoinByInviteLink:
                type: object
                description: |-
                  Сериализатор ответа для присоединения к чату по пригласительной ссылке.

                  {
                      'action': 'join_by_invite_link',
                      'object': {
                          'chat_key': идентификатор чата/канала,
                          'chat_type': тип чата,
                          'joined_user': {
                              'uid': идентификатор пользователя,
                              'full_name': ФИО пользователя
                          }
                      }
                  }
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/ActionD1dEnum'
                    default: join_by_invite_link
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/JoinByInviteLinkObjectSerializer'
                required:
                - object
              SerializerResponseLeaveChat:
                type: object
                description: Формат ответа о выходе из чата.
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action926Enum'
                    default: leave_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/LeaveChatObjectSerializer'
                required:
                - object
              SerializerResponseMessageDelete:
                type: object
                description: Сериализатор для ответа удаления сообщения.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  chat_id:
                    type: integer
                    nullable: true
                    description: чат сообщения
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                required:
                - chat_id
                - from_user
                - id
                - to_user
                - uid
              SerializerResponseMessageReadStatus:
                type: object
                description: Сериализатор для ответа изменения статуса о прочтении сообщения.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/ShortUserSerializer'
                    readOnly: true
                  new:
                    type: boolean
                    description: статус нового сообщения
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  chat_data:
                    allOf:
                    - $ref: '#/components/schemas/ChatObjectSerializer'
                    readOnly: true
                  reader_uid:
                    type: string
                    nullable: true
                    description: UID пользователя который читает сообщение
                required:
                - chat_data
                - created_at
                - from_user
                - id
                - new
                - to_user
                - uid
                - updated_at
              SerializerResponseNewCallMessageForSwagger:
                type: object
                description: Сериализатор для документации WebRTC (новое сообщение о звонке).
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/SerializerResponseNewCallMessageForSwaggerActionEnum'
                  object:
                    $ref: '#/components/schemas/GETNewCallMessageSerializer'
                required:
                - action
                - error
                - object
              SerializerResponseNewCallMessageForSwaggerActionEnum:
                enum:
                - new_call_message
                type: string
                description: '* `new_call_message` - new_call_message'
              SerializerResponseObjectAddMembersToChat:
                type: object
                description: |-
                  Сериализатор для object-поля при добавлении участников в чат.

                  {
                      'chat_key': идентификатор чата,
                      'chat_type': тип чата,
                      'added_users': [
                          {
                              'uid': идентификатор пользователя,
                              'full_name': ФИО пользователя
                          },
                          ...
                      ]
                  }
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата
                  chat_type:
                    type: string
                    description: Тип чата
                  added_users:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatParticipantSerializer'
                    description: Список добавленных участников
                required:
                - added_users
                - chat_key
                - chat_type
              SerializerResponseObjectCreateChatMessage:
                type: object
                description: |-
                  Ответ на создание чата или канала.

                  {
                      'created_by': uid_создателя,
                      'owner_full_name': ФИО владельца канала/группы,
                      'chat_key': идентификатор чата,
                      'chat_id': UID чата,
                      'name': наименование чата,
                      'description': описание группы/канала,
                      'chat_type': тип чата,
                      'avatar': {
                          'filename': название файла аватара,
                          'url': ссылка на аватар
                      },
                      'avatar_webp_url': ссылка на WebP аватар,
                      'avatar_small_url': ссылка на маленький аватар,
                      'avatar_master_url': ссылка на оригинал аватара,
                      'added_users': [
                          {
                              'uid': uid_пользователя,
                              'full_name': ФИО пользователя
                          }
                      ]
                  }

                  TODO(legacy): после полного перехода клиентов на avatar_uid удалить
                  legacy-контракт avatar={filename,url} из этого сериализатора и оставить
                  только avatar_webp_url/avatar_small_url/avatar_master_url.
                properties:
                  created_by:
                    type: string
                    readOnly: true
                  owner_full_name:
                    type: string
                    readOnly: true
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  chat_id:
                    type: string
                    description: UID чата
                  name:
                    type: string
                  description:
                    type: string
                    nullable: true
                  chat_type:
                    $ref: '#/components/schemas/ChatType5a4Enum'
                  avatar:
                    allOf:
                    - $ref: '#/components/schemas/AvatarDataSerializer'
                    readOnly: true
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: URL аватара в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: URL маленького аватара
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: URL защищенного оригинала аватара
                  added_users:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatParticipantSerializer'
                    readOnly: true
                    description: Список участников чата/канала
                required:
                - added_users
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_webp_url
                - chat_id
                - chat_key
                - chat_type
                - created_by
                - description
                - name
                - owner_full_name
              SerializerResponseOfferForSwagger:
                type: object
                description: Сериализатор для ответа на предложение звонка.
                properties:
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    type: string
                    default: OK
                  error:
                    type: string
                    readOnly: true
                    description: Всегда null
                  action:
                    $ref: '#/components/schemas/Action433Enum'
                  object:
                    $ref: '#/components/schemas/SerializerResponseCallOffer'
                required:
                - action
                - error
                - object
              SerializerResponseRemoveMembersFromChat:
                type: object
                description: Сериализатор для удаления участников из группы/канала.
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action0cdEnum'
                    default: remove_members_from_chat
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/RemoveMembersFromChatObjectSerializer'
                required:
                - object
              SerializerResponseTransferOwner:
                type: object
                description: |-
                  Сериализатор ответа для передачи прав владельца чата.

                  Наследует стандартную структуру BaseWebSocketObjectResponse:
                  {
                      'action': 'transfer_owner',
                      'request_uid': 'uuid-запроса',
                      'status': 'OK' или 'error',
                      'error': null или 'текст ошибки',
                      'object': {данные о новом владельце}
                  }
                properties:
                  action:
                    allOf:
                    - $ref: '#/components/schemas/Action8adEnum'
                    default: transfer_owner
                  request_uid:
                    type: string
                    format: uuid
                    description: 'Уникальный идентификатор запроса (например: a1b2c3d4-e5f6-7890-abcd-ef1234567890)'
                  status:
                    allOf:
                    - $ref: '#/components/schemas/StatusBa8Enum'
                    default: OK
                    description: |-
                      Статус выполнения операции (OK или error)

                      * `OK` - OK
                      * `error` - error
                  error:
                    type: string
                    nullable: true
                    description: Описание ошибки в случае неудачного выполнения или null
                  object:
                    $ref: '#/components/schemas/TransferOwnerObjectSerializer'
                required:
                - object
              SerializerResponseUpdateMessage:
                type: object
                description: Сериализатор для ответа на обновление сообщения.
                properties:
                  action:
                    $ref: '#/components/schemas/ActionBebEnum'
                  request_uid:
                    type: string
                    format: uuid
                    description: uid - запроса Websocket
                  status:
                    $ref: '#/components/schemas/StatusF1eEnum'
                  error:
                    type: string
                    description: Описание ошибки
                  object:
                    $ref: '#/components/schemas/GETMessageModelSerializer'
                required:
                - action
                - object
                - request_uid
                - status
              SerializerUserForMessageWebRTC:
                type: object
                description: Сериализатор для пользователя в сообщении о звонке.
                properties:
                  uid:
                    type: string
                    format: uuid
                    title: Ид
                  username:
                    type: string
                    title: Имя пользователя
                    description: имя пользователя
                    maxLength: 250
                  first_name:
                    type: string
                    title: Имя
                    maxLength: 150
                  last_name:
                    type: string
                    title: Фамилия
                    maxLength: 150
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                required:
                - avatar
                - avatar_master_url
                - avatar_url
                - username
              ServiceMessage:
                type: object
                properties:
                  email:
                    type: string
                    format: email
                    title: E-mail
                    maxLength: 254
                  text:
                    type: string
                    title: Текст проблемы
                    maxLength: 500
                required:
                - email
                - text
              ShortMessageModelSerializer:
                type: object
                description: Краткий сериализатор сообщения (LEGACY для WebSocket).
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    type: string
                    readOnly: true
                    description: автор сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/SuperShortFileModelSerializer'
                    readOnly: true
                    description: список файлов
                required:
                - files_list
                - from_user
                - id
                - uid
              ShortRTCModel:
                type: object
                description: |-
                  Сериализатор краткой информации о звонке (RTC).

                  Используется и в REST API, и в WebSocket для отображения
                  информации о звонке, привязанном к сообщению.
                properties:
                  uid:
                    type: string
                    format: uuid
                    description: uid звонка
                  duration:
                    type: integer
                    description: длительность звонка в секундах
                  status:
                    type: string
                    description: статус звонка
                  updated_at:
                    type: string
                    description: время обновления звонка
                  created_at:
                    type: string
                    description: время создания звонка
                required:
                - created_at
                - duration
                - status
                - uid
                - updated_at
              ShortRTCModelSerializer:
                type: object
                description: 'LEGACY: краткая информация о звонке (RTC) для WebSocket.'
                properties:
                  uid:
                    type: string
                    format: uuid
                    description: uid звонка
                  duration:
                    type: integer
                    description: длительность звонка в секундах
                  status:
                    type: string
                    description: статус звонка
                  updated_at:
                    type: string
                    description: время обновления звонка
                  created_at:
                    type: string
                    description: время создания звонка
                required:
                - created_at
                - duration
                - status
                - uid
                - updated_at
              ShortUser:
                type: object
                description: Сериализатор для краткой информации о пользователе.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  patronymic:
                    type: string
                    description: отчество
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_filled:
                    type: boolean
                    readOnly: true
                    description: профиль заполнен
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - is_deleted
                - is_filled
                - uid
              ShortUserSerializer:
                type: object
                description: Сериализатор для краткой информации о пользователе.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  patronymic:
                    type: string
                    description: отчество
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_filled:
                    type: boolean
                    readOnly: true
                    description: профиль заполнен
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - is_deleted
                - is_filled
                - uid
              Status1e9Enum:
                enum:
                - publish
                - draft
                type: string
                description: |-
                  * `publish` - publish
                  * `draft` - draft
              Status941Enum:
                enum:
                - initiated
                - answered
                - connecting
                - connected
                - unreceived
                - rejected
                - completed
                - failed
                type: string
                description: |-
                  * `initiated` - Инициирован
                  * `answered` - Подтвержден
                  * `connecting` - Устанавливается
                  * `connected` - Соединен
                  * `unreceived` - Не принятый
                  * `rejected` - Отклоненный
                  * `completed` - Завершенный
                  * `failed` - Не удалось соединиться
              StatusBa8Enum:
                enum:
                - OK
                - error
                type: string
                description: |-
                  * `OK` - OK
                  * `error` - error
              StatusF1eEnum:
                enum:
                - OK
                type: string
                description: '* `OK` - OK'
              SuperShortFileModel:
                type: object
                description: |-
                  Краткий сериализатор файлов сообщения.

                  Используется в FileListSerializer и других базовых сериализаторах.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file:
                    type: string
                    format: uri
                    title: Файл
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp:
                    type: string
                    format: uri
                    nullable: true
                    title: Файл webp
                    description: файл webp
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - created_at
                - download_name
                - file
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp_url
                - id
                - media_kind
                - uid
                - updated_at
              SuperShortFileModelSerializer:
                type: object
                description: 'LEGACY: краткий сериализатор файлов сообщения для WebSocket.'
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file:
                    type: string
                    format: uri
                    title: Файл
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp:
                    type: string
                    format: uri
                    nullable: true
                    title: Файл webp
                    description: файл webp
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  new:
                    type: boolean
                    title: Новое сообщение
                    description: новое сообщение (непрочитанное)
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - created_at
                - download_name
                - file
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp_url
                - id
                - media_kind
                - uid
                - updated_at
              SuperShortUserSerializer:
                type: object
                description: Сериализатор для информации о пользователе.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    description: логин
                  nickname:
                    type: string
                    description: ник
                    maxLength: 32
                    minLength: 5
                  phone:
                    type: string
                    description: номер телефона
                  first_name:
                    type: string
                    description: имя
                  last_name:
                    type: string
                    description: фамилия
                  patronymic:
                    type: string
                    description: отчество
                  avatar:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_webp:
                    type: string
                    readOnly: true
                    description: ссылка на изображение клиента в формате WebP
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  additional_information:
                    type: string
                    description: о себе
                  birthday:
                    type: string
                    description: временная метка дня рождения в секундах
                required:
                - avatar
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp
                - avatar_webp_url
                - is_deleted
                - uid
              TokenRefresh:
                type: object
                properties:
                  access:
                    type: string
                    readOnly: true
                  refresh:
                    type: string
                required:
                - access
                - refresh
              TransferOwnerObjectSerializer:
                type: object
                description: |-
                  Сериализатор для object-поля при передаче прав владельца чата.

                  {
                      'chat_key': идентификатор чата,
                      'chat_type': тип чата,
                      'new_owner': {
                          'uid': uid нового владельца,
                          'full_name': ФИО нового владельца
                      }
                  }
                properties:
                  chat_key:
                    type: string
                    description: Идентификатор чата/канала
                  chat_type:
                    type: string
                    description: Тип чата/канала
                  new_owner:
                    allOf:
                    - $ref: '#/components/schemas/ChatParticipantSerializer'
                    description: Новый владелец
                required:
                - chat_key
                - chat_type
                - new_owner
              TypeCompleteEnum:
                enum:
                - unreceived
                - rejected
                - completed
                type: string
                description: |-
                  * `unreceived` - unreceived
                  * `rejected` - rejected
                  * `completed` - completed
              UploadStatusEnum:
                enum:
                - draft
                - attached
                - expired
                - deleted
                type: string
                description: |-
                  * `draft` - Черновик
                  * `attached` - Прикреплён
                  * `expired` - Истёк
                  * `deleted` - Удалён
              UserForAdd:
                type: object
                description: |-
                  Сериализатор пользователя для добавления в группу/канал.

                  Возвращает минимальный набор полей для списка пользователей,
                  которых можно добавить в группу или канал.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение пользователя
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение пользователя в формате WebP
                  avatar_small_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение пользователя в формате small JPEG
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  is_online:
                    type: boolean
                    description: статус подключения
                    readOnly: true
                  was_online_at:
                    type: integer
                    nullable: true
                    description: время последнего подключения (timestamp)
                    readOnly: true
                  first_name:
                    type: string
                    readOnly: true
                    description: имя
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия
                required:
                - avatar_master_url
                - avatar_small_url
                - avatar_url
                - avatar_webp_url
                - first_name
                - is_deleted
                - is_online
                - last_name
                - uid
                - was_online_at
              ValidationError:
                type: object
                properties:
                  field_name:
                    type: array
                    items:
                      type: string
                    description: Список ошибок для конкретного поля
                required:
                - field_name
              VoiceAttachmentUploadResult:
                type: object
                description: Результат загрузки голосового вложения перед отправкой сообщения.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  download_name:
                    type: string
                    title: Имя файла для скачивания
                    description: оригинальное имя файла для клиента
                    maxLength: 255
                  media_kind:
                    allOf:
                    - $ref: '#/components/schemas/MediaKindEnum'
                    title: Тип медиа вложения
                    description: |-
                      классификация вложения по типу медиа

                      * `image` - Изображение
                      * `file` - Файл
                      * `voice` - Голосовое сообщение
                  upload_status:
                    allOf:
                    - $ref: '#/components/schemas/UploadStatusEnum'
                    title: Статус загрузки вложения
                    description: |-
                      жизненный цикл вложения

                      * `draft` - Черновик
                      * `attached` - Прикреплён
                      * `expired` - Истёк
                      * `deleted` - Удалён
                  duration_seconds:
                    type: integer
                    maximum: 2147483647
                    minimum: 0
                    nullable: true
                    title: Длительность в секундах
                    description: длительность voice-вложения
                required:
                - uid
              WSCreateTextMessageSerializer:
                type: object
                description: Top-level сериализатор ответа create_text_message.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    allOf:
                    - $ref: '#/components/schemas/WSUserSlimSerializer'
                    readOnly: true
                  to_user:
                    allOf:
                    - $ref: '#/components/schemas/WSUserSlimSerializer'
                    readOnly: true
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  replied_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/WSRepliedMessageSerializer'
                    readOnly: true
                    description: ответ на
                  forwarded_messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/WSForwardedSnapshotSerializer'
                    readOnly: true
                    description: пересылаемые сообщения
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/WSMessageFileSerializer'
                    readOnly: true
                    description: список файлов
                  new:
                    type: boolean
                  created_at:
                    type: string
                    readOnly: true
                    description: время создания
                  updated_at:
                    type: string
                    readOnly: true
                    description: время обновления
                  chat_id:
                    type: integer
                    description: Получить ID чата из context.
                    readOnly: true
                  chat_key:
                    type: string
                    description: Получить ключ чата из context.
                    readOnly: true
                  chat_type:
                    type: string
                    description: Получить тип чата из context.
                    readOnly: true
                  message_rtc:
                    allOf:
                    - $ref: '#/components/schemas/ShortRTCModelSerializer'
                    readOnly: true
                    description: объект звонка привязанного к этому сообщению
                required:
                - chat_id
                - chat_key
                - chat_type
                - created_at
                - files_list
                - forwarded_messages
                - from_user
                - id
                - message_rtc
                - new
                - replied_messages
                - to_user
                - uid
                - updated_at
              WSForwardedSnapshotSerializer:
                type: object
                description: Forwarded элемент для WS через snapshot (uid = uid snapshot).
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  from_user:
                    type: string
                    format: uuid
                    readOnly: true
                    description: автор оригинального сообщения (uid)
                  first_name:
                    type: string
                    readOnly: true
                    description: имя автора пересылаемого сообщения
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия автора пересылаемого сообщения
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                  content:
                    type: string
                    title: Сообщение (snapshot)
                    description: контент пересылаемого сообщения на момент создания snapshot
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/WSMessageFileSerializer'
                    readOnly: true
                    description: список файлов
                required:
                - avatar_master_url
                - avatar_url
                - avatar_webp_url
                - files_list
                - first_name
                - from_user
                - id
                - last_name
                - uid
              WSMessageFileSerializer:
                type: object
                description: Файл сообщения для WS create_text_message.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  download_name:
                    type: string
                    readOnly: true
                    description: имя файла для скачивания
                  media_kind:
                    type: string
                    readOnly: true
                    description: тип медиа вложения
                  file_url:
                    type: string
                    nullable: true
                    description: файл (url-путь)
                    readOnly: true
                  file_protected_url:
                    type: string
                    nullable: true
                    description: защищенный endpoint оригинала файла
                    readOnly: true
                  file_webp_url:
                    type: string
                    nullable: true
                    description: signed webp preview файла
                    readOnly: true
                  file_small_url:
                    type: string
                    nullable: true
                    description: signed jpeg preview файла
                    readOnly: true
                  file_type:
                    type: string
                    nullable: true
                    title: Mime-тип
                    maxLength: 128
                  created_at:
                    type: string
                    readOnly: true
                  updated_at:
                    type: string
                    readOnly: true
                required:
                - created_at
                - download_name
                - file_protected_url
                - file_small_url
                - file_url
                - file_webp_url
                - id
                - media_kind
                - uid
                - updated_at
              WSRepliedMessageSerializer:
                type: object
                description: Вложенное replied сообщение для WS.
                properties:
                  id:
                    type: integer
                    readOnly: true
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                    description: автор удален
                  from_user:
                    type: string
                    format: uuid
                    readOnly: true
                    description: автор сообщения (uid)
                  first_name:
                    type: string
                    readOnly: true
                    description: имя автора replied сообщения
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия автора replied сообщения
                  content:
                    type: string
                    title: Сообщение
                    description: сообщение в формате разметки RichField
                    maxLength: 4096
                  files_list:
                    type: array
                    items:
                      $ref: '#/components/schemas/WSMessageFileSerializer'
                    readOnly: true
                    description: список файлов
                required:
                - files_list
                - first_name
                - from_user
                - id
                - is_deleted
                - last_name
                - uid
              WSSuperShortUserSerializer:
                type: object
                description: Сериализатор для суперкороткого пользователя с дополнительной информацией.
                properties:
                  is_online:
                    type: boolean
                    title: Подключен
                  was_online_at:
                    type: string
                    description: временная метка времени on-line регистрации
                  user:
                    allOf:
                    - $ref: '#/components/schemas/SuperShortUserSerializer'
                    description: модель пользователя
                required:
                - user
              WSUserSlimSerializer:
                type: object
                description: Пользователь для WS сообщений.
                properties:
                  uid:
                    type: string
                    format: uuid
                    readOnly: true
                  is_deleted:
                    type: boolean
                    readOnly: true
                  username:
                    type: string
                    title: Имя пользователя
                    description: имя пользователя
                    maxLength: 250
                  nickname:
                    type: string
                    title: Nick Name
                    pattern: ^[a-z0-9._]{6,32}$
                    maxLength: 32
                  first_name:
                    type: string
                    readOnly: true
                    description: имя
                  last_name:
                    type: string
                    readOnly: true
                    description: фамилия
                  avatar_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента
                  avatar_master_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на защищенный endpoint аватара
                  avatar_webp_url:
                    type: string
                    readOnly: true
                    description: url-ссылка на изображение клиента в формате WebP
                required:
                - avatar_master_url
                - avatar_url
                - avatar_webp_url
                - first_name
                - is_deleted
                - last_name
                - nickname
                - uid
                - username
              WebSocketErrorResponse:
                type: object
                description: |-
                  Базовый сериализатор для ошибок WebSocket.

                  Стандартный формат ошибки:
                  {
                      'action': 'Название действия',
                      'request_uid': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      'status': 'error',
                      'error': 'Описание ошибки',
                      'object': null
                  }
                properties:
                  action:
                    type: string
                    default: Название действия
                    description: Название действия, при котором произошла ошибка
                  request_uid:
                    type: string
                    format: uuid
                    description: Уникальный идентификатор запроса
                  status:
                    allOf:
                    - $ref: '#/components/schemas/WebSocketErrorResponseStatusEnum'
                    default: error
                    description: |-
                      Статус ответа всегда error

                      * `error` - error
                  error:
                    type: string
                    description: Описание ошибки
                  object:
                    type: 'null'
                    example: null
                    readOnly: true
                    description: Всегда null для ошибок
                required:
                - error
                - object
              WebSocketErrorResponseStatusEnum:
                enum:
                - error
                type: string
                description: '* `error` - error'

securitySchemes:
jwtAuth:
type: http
scheme: bearer
bearerFormat: JWT
description: Авторизация через JWT. Введите ваш Access Token.
