# Telegram Bot Setup Guide

## 📱 Control Your Terminal from Telegram

This bot allows you to control your development terminal remotely through Telegram, perfect for when you're away from your computer but need to interact with Claude or manage your project.

## 🚀 Quick Setup

### Step 1: Create Your Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Choose a name for your bot (e.g., "My Terminal Controller")
4. Choose a username (must end in 'bot', e.g., "myterminal_bot")
5. Copy the token you receive (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Telegram User ID

1. Search for `@userinfobot` in Telegram
2. Start a chat with it
3. It will show your User ID (a number like: `123456789`)
4. Save this number - you'll need it for authorization

### Step 3: Configure Environment Variables

Create a `.env.telegram` file in the telegram-bot directory:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_AUTHORIZED_USERS=YOUR_USER_ID_HERE
PROJECT_PATH=/Volumes/DATA/dev/supover-vibe

# Multiple users (comma-separated)
# TELEGRAM_AUTHORIZED_USERS=123456789,987654321
```

### Step 4: Install and Run

```bash
# Install dependencies (already done)
npm install node-telegram-bot-api dotenv

# Compile TypeScript
npx tsc telegram-bot/bot.ts --outDir telegram-bot/dist

# Run the bot
node telegram-bot/dist/bot.js
```

Or add to package.json:
```json
"scripts": {
  "bot": "tsx telegram-bot/bot.ts",
  "bot:build": "tsc telegram-bot/bot.ts --outDir telegram-bot/dist",
  "bot:start": "node telegram-bot/dist/bot.js"
}
```

## 📋 Available Commands

### Basic Commands
- `/start` - Initialize bot and show help
- `/status` - Check system status
- `/pwd` - Show current directory
- `/ls` - List files in current directory
- `/help` - Show help message

### Execution Commands
- `/exec [command]` - Execute any shell command
  - Example: `/exec npm run build`
- `/npm [command]` - Run npm commands
  - Example: `/npm test`
- `/git [command]` - Run git commands
  - Example: `/git status`

### Claude Integration
- `/claude [prompt]` - Send a prompt to Claude
  - Example: `/claude Fix the type error in advances.ts`
- `/response [answer]` - Respond to Claude's questions
  - Example: `/response Yes, please proceed with the fix`

### System Commands
- `/logs` - Show recent system logs

## 🔒 Security Features

1. **User Authorization**: Only whitelisted Telegram user IDs can use the bot
2. **Dangerous Command Blocking**: Commands like `rm -rf` are automatically blocked
3. **Command Timeout**: Commands timeout after 30 seconds to prevent hanging
4. **Encrypted Communication**: All Telegram communication is encrypted

## 💡 Usage Examples

### 1. Check Project Status
```
You: /git status
Bot: ✅ Output:
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   package.json
```

### 2. Run Tests Remotely
```
You: /npm test
Bot: ⏳ Executing: npm test
Bot: ✅ Output:
Test Suites: 1 passed, 1 total
Tests: 9 passed, 9 total
```

### 3. Interact with Claude
```
You: /claude Should I implement caching for the API endpoints?
Bot: 🤖 Claude Interaction
Your prompt will be sent to Claude...

[Later when Claude responds]
Bot: 🤖 Claude is asking:
What's the expected traffic volume for these endpoints?

You: /response About 1000 requests per minute during peak hours
Bot: ✅ Response sent to Claude
```

### 4. Quick Deployment
```
You: /exec npm run build && npm run deploy
Bot: ⏳ Executing: npm run build && npm run deploy
Bot: ✅ Output:
Build successful!
Deploying to production...
Deployment complete!
```

## 🔄 Running as a Service

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start the bot
pm2 start telegram-bot/dist/bot.js --name "telegram-bot"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Using systemd (Linux)
Create `/etc/systemd/system/telegram-bot.service`:

```ini
[Unit]
Description=Telegram Terminal Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/Volumes/DATA/dev/supover-vibe
ExecStart=/usr/bin/node telegram-bot/dist/bot.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
```

## 🎯 Advanced Features

### Custom Keyboards
The bot supports inline keyboards for quick actions:
- Approve/Reject buttons for Claude questions
- Quick command shortcuts
- Navigation buttons

### Session Management
Each user has their own session with:
- Current directory tracking
- Command history
- Claude interaction context

### Notification System
Get instant notifications when:
- Claude needs input
- Long-running commands complete
- Errors occur
- Deployments finish

## 🐛 Troubleshooting

### Bot not responding
1. Check if token is correct
2. Verify your user ID is in TELEGRAM_AUTHORIZED_USERS
3. Check bot logs for errors

### Commands not working
1. Ensure you're in the correct directory
2. Check if the command exists
3. Verify permissions

### Connection issues
1. Check internet connection
2. Verify Telegram API is accessible
3. Try restarting the bot

## 🚦 Status Indicators

- ⏳ Command is executing
- ✅ Command successful
- ❌ Command failed
- ⚠️ Warning or caution
- 🤖 Claude interaction
- 📁 File/Directory operation
- 📊 Status information
- 📜 Logs or output

## 📝 Notes

- Keep your bot token secret - never commit it to Git
- Regularly update the authorized users list
- Monitor bot logs for suspicious activity
- Use command timeouts for long-running operations
- Consider rate limiting for production use

## 🔗 Integration with Claude

The bot can act as a bridge between you and Claude:
1. Claude asks a question → Bot sends it to Telegram
2. You respond via Telegram → Bot sends response to Claude
3. Claude continues working → You get notified of results

This creates a seamless workflow where you can guide Claude's development decisions even when away from your computer!