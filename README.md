# Twitch Chat Bot

This project is a Twitch-integrated bot or dashboard that connects a custom frontend with a Bun-powered backend.

📚 **[Pełna dokumentacja komend w języku polskim → DOCS.md](DOCS.md)**

## 1. Prerequisites

Ensure you have [bun](https://bun.com/docs/installation) installed on your machine.

Before starting, ensure you have a registered application on Twitch.

- Twitch Developer Account: Register an app at the [Twitch Dev Console](https://dev.twitch.tv/console).

- Confidential Client: Ensure your "Client Type" is set to Confidential in the console.

- Set Redirect URI:
  - http://localhost:3302/api/auth/callback/setup (default host and port)
  - http://localhost:3302/api/auth/callback/app (default host and port)
  - https://twitchtokengenerator.com (optional, for manual setup).

- Save client id and client secret for later.

## Configuration & Tokens

### Generate OAuth Tokens

#### Automatically (recommended)

> [!IMPORTANT]
> You need to be signed in as your **BOT Account**, this account will send messages etc..
> For example if your channel name is Streamer1 and your bot account is Bot1, you must be signed in on twitch as Bot1.
> If you do not have separate bot account, you can use your streamer account.


1.  Set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` in [env](#backend)

2.  In /backend run `bun setup-auth`

3.  Open link from terminal `GO TO: _link_` in browser

4.  Copy `REFRESH_TOKEN` and paste it to `TWITCH_REFRESH_TOKEN` [env](#backend)

#### Manually

1. Go to [Twitch Token Generator.](https://twitchtokengenerator.com/?scope=chat%3Aread+chat%3Aedit+moderator%3Amanage%3Abanned_users+user%3Abot+user%3Aread%3Achat+user%3Awrite%3Achat)

2. Select "Use My Client Secret and Client ID".

3. Input your Client ID and Client Secret from the Twitch Console.

4. In "Use My Client Secret and Client ID" section

- Input your client id and client secret
- Select those scopes: chat:read
  - chat:read
  - chat:edit
  - user:bot
  - user:read:chat
  - user:write:chat
  - moderator:manage:banned_users
- Copy generated tokens to your .env

5. Click Generate and keep the tab open.

### Environment Setup

#### Frontend

```
VITE_WS_URL=ws://localhost:3302/api/ws
VITE_API_URL=http://localhost:3302/
```

#### Backend

```
APP_ORIGINS=http://localhost:3301,http://192.168.0.1:3301
API_URL=http://localhost:3302
PORT=3302
APP_REDIRECT_URI=http://localhost:3302/api/auth/callback/app
SETUP_REDIRECT_URI=http://localhost:3302/api/auth/callback/setup
JWT_SECRET=openssl rand -hex 32
FRONTEND_URL=http://localhost:3301
COOKIE_DOMAIN=localhost
TWITCH_CLIENT_ID=twitch_dev_client_id
TWITCH_CLIENT_SECRET=twitch_dev_client_secret
TWITCH_REFRESH_TOKEN=generated_refresh_token
TWITCH_BROADCASTER_NAME=channel_name_where_bot_works
# Optional: Define command prefix (default is "!")
COMMAND_PREFIX="!"
# Optional: Comma-separated list of usernames to treat as moderators
USERS_TREATED_AS_MODERATORS=mod_username1,mod_username2

# Optional: YouTube Authentication
YT_COOKIE="OPTIONAL BUT RECOMMENDED https://ytjs.dev/guide/authentication.html#cookies"
```

## 3. Installation & Running

### Install dependencies

Run `bun install` in project root

### Start frontend

```bash
cd frontend
bun dev
```

### Start frontend

```bash
cd backend
bun dev
```

## Testing

```bash
cd backend
bun test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue to report bugs and suggest new features. Ensure your code follows the existing style and include a brief description of your changes.
