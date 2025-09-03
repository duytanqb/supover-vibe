# Telegram-Claude Integration

## Overview
This integration enables remote control of your development environment and direct communication with Claude via Telegram.

## Available Bots

### 1. Simple Bot (`simple-bot.js`)
Basic terminal control via Telegram.

**Features:**
- Execute shell commands
- Run npm/git commands  
- Browse directories
- Check system status

**Start:** `node telegram-bot/simple-bot.js`

### 2. Claude Bridge (`claude-bridge.js`)
Manual file-based communication with Claude.

**Features:**
- Send prompts to Claude via files
- Manual response relay
- Conversation management

**Start:** `node telegram-bot/claude-bridge.js`

### 3. Auto Bridge (`claude-auto-bridge.js`)
Automated message relay with manual Claude trigger.

**Features:**
- Auto-save Telegram messages
- Claude can execute commands to respond
- Message history tracking

**Start:** `node telegram-bot/claude-auto-bridge.js`

### 4. Webhook Bridge (`claude-webhook-bridge.js`) ⭐ RECOMMENDED
Direct webhook-based communication - no manual triggering needed!

**Features:**
- Webhook server on port 3456
- Claude can send instant responses
- Seamless bi-directional communication
- No manual intervention required

**Start:** `node telegram-bot/claude-webhook-bridge.js`

## Setup

### 1. Configure Bot Token
Edit `.env.telegram`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_AUTHORIZED_USERS=your_user_id
PROJECT_PATH=/path/to/project
WEBHOOK_PORT=3456  # For webhook bridge
```

### 2. Install Dependencies
```bash
npm install node-telegram-bot-api dotenv
```

### 3. Start Your Preferred Bot
```bash
# Recommended - Full automation
node telegram-bot/claude-webhook-bridge.js

# Or run in background
node telegram-bot/claude-webhook-bridge.js &
```

## Usage Examples

### With Webhook Bridge (Recommended)

1. **Start the bot:**
   ```bash
   node telegram-bot/claude-webhook-bridge.js
   ```

2. **Send /start in Telegram** to initialize

3. **Just type messages** - Claude will respond automatically!

4. **Claude can respond using:**
   ```bash
   # Via curl
   curl -X POST http://localhost:3456/claude-response \
     -H "Content-Type: application/json" \
     -d '{"message": "Your response", "chatId": "USER_CHAT_ID"}'
   
   # Via helper script
   ./telegram-bot/claude-telegram.sh "Your message"
   
   # Direct Telegram API
   curl -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{"chat_id": CHAT_ID, "text": "Message"}'
   ```

### Commands Available in Telegram

- `/start` - Initialize bot
- `/status` - Check system status
- `/exec [command]` - Execute shell command
- `/npm [command]` - Run npm command
- `/git [command]` - Run git command
- `/pwd` - Show current directory
- `/ls` - List files
- Any text message - Relayed to Claude

## How Claude-Telegram Communication Works

### Webhook Bridge Flow (Automated)
1. User sends message in Telegram
2. Bot saves to `claude-prompt.txt`
3. Bot notifies Claude via webhook is ready
4. Claude reads prompt and processes
5. Claude sends response via webhook
6. Response appears instantly in Telegram

### Manual Bridge Flow
1. User sends message in Telegram  
2. Message saved to file
3. User runs trigger command in terminal
4. Claude reads and responds
5. Response sent to Telegram

## Security Features

- User authorization by Telegram ID
- Command filtering (dangerous commands blocked)
- Timeout protection on executions
- Isolated file-based communication
- Local webhook (not exposed to internet)

## Troubleshooting

### Bot not responding
- Check bot token in `.env.telegram`
- Verify user ID is authorized
- Ensure node process is running

### Claude responses not appearing
- With webhook: Check server is on port 3456
- Check `last-chat.json` has valid chat ID
- Verify Claude is using correct response method

### Webhook connection refused
- Ensure webhook bridge is running
- Check port 3456 is not in use
- Verify localhost connectivity

## Files Created

- `claude-prompt.txt` - Incoming messages from Telegram
- `claude-response.txt` - Responses for manual relay
- `last-chat.json` - Stores active chat context
- `claude-telegram.sh` - Helper script for responses
- `claude-command.sh` - Auto-generated response commands

## Best Practices

1. **Use webhook bridge** for best experience
2. **Keep bot running** in background or tmux/screen
3. **Monitor logs** for debugging
4. **Test webhook** with status endpoint: `curl http://localhost:3456/status`
5. **Restart bot** if communication stops

## Advanced Usage

### Running Multiple Bots
You can run multiple bots for different purposes:
```bash
# Terminal 1: Webhook bridge for Claude
node telegram-bot/claude-webhook-bridge.js

# Terminal 2: Simple bot for quick commands  
node telegram-bot/simple-bot.js
```

### Custom Webhook Port
Edit `.env.telegram`:
```env
WEBHOOK_PORT=4567  # Custom port
```

### Batch Commands
Send multiple commands:
```
/exec ls && pwd && git status
```

## Support

For issues or improvements, check the implementation in:
- `/telegram-bot/` directory
- Each bot's source code has inline documentation

Happy remote development! 🚀