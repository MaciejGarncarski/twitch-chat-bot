To run this project you need

- bun

## Prerequisites

- Twitch Developer Account: Register an app at the Twitch Dev Console.

- Confidential Client: Ensure your "Client Type" is set to Confidential in the console.

- Redirect URI: Add https://twitchtokengenerator.com (for initial setup) and http://localhost:3000 to your OAuth Redirect URLs.

## Generating access & refresh tokens

1. Go to [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/)

2. In "Use My Client Secret and Client ID" section

   - Input your client id and client secret
   - Select those scopes: chat:read
     - chat:read
     - chat:edit
     - user:bot
     - user:read:chat
     - user:write:chat
   - Copy generated tokens to your .env

## ENV

Frontend

```
VITE_WS_URL=ws://localhost:3302/api/ws
VITE_API_URL=http://localhost:3302/
```

Backend

```
APP_ORIGINS=http://localhost:3301,http://192.168.0.1:3301
API_URL=http://localhost:3302
PORT=3302
TWITCH_CLIENT_ID=twitch_dev_client_id
TWITCH_CLIENT_SECRET=twitch_dev_client_secret
TWITCH_ACCESS_TOKEN=generated_access_token
TWITCH_REFRESH_TOKEN=generated_refresh_token
TWITCH_BROADCASTER_ID=user_id_where_bot_works
YT_COOKIE="OPTIONAL BUT RECOMMENDED https://ytjs.dev/guide/authentication.html#cookies"
```

## Running Project

Fill env then run `bun install` in project root

In /frontend and /backend each run `bun dev`
