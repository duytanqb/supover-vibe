#!/usr/bin/env node

/**
 * Simple Claude-Telegram Bot
 * Direct message handling without queues - processes each message once
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({ path: path.join(__dirname, '.env.telegram') });

// Configuration
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const AUTHORIZED_USERS = process.env.TELEGRAM_AUTHORIZED_USERS?.split(',').map(id => parseInt(id)) || [];
const PROJECT_PATH = process.env.PROJECT_PATH || process.cwd();

// Simple file for Claude to read messages
const CLAUDE_MESSAGES = path.join(__dirname, 'messages.txt');

if (!TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not set in .env.telegram');
  process.exit(1);
}

// Create bot instance - set polling options to prevent duplicates
const bot = new TelegramBot(TOKEN, { 
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Track processed messages to avoid duplicates
const processedMessages = new Set();

// Authorization check
function isAuthorized(userId) {
  return AUTHORIZED_USERS.length === 0 || AUTHORIZED_USERS.includes(userId);
}

// Save message for Claude to read
function saveMessageForClaude(userId, message, timestamp) {
  const content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 NEW TELEGRAM MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From User: ${userId}
Time: ${timestamp}
Message: ${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To respond, use:
./telegram-bot/send "Your response here"
`;
  
  fs.writeFileSync(CLAUDE_MESSAGES, content);
  console.log(`\n📥 Saved message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
}

// Create send script for Claude
function createSendScript() {
  const sendScript = `#!/usr/bin/env node
// Simple send script for Claude
const https = require('https');

const TOKEN = '${TOKEN}';
const CHAT_ID = ${AUTHORIZED_USERS[0] || 'null'};
const message = process.argv.slice(2).join(' ');

if (!message) {
  console.error('Usage: ./send "Your message"');
  process.exit(1);
}

const data = JSON.stringify({
  chat_id: CHAT_ID,
  text: '🤖 ' + message,
  parse_mode: 'Markdown'
});

const options = {
  hostname: 'api.telegram.org',
  path: '/bot' + TOKEN + '/sendMessage',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Message sent to Telegram');
  } else {
    console.error('❌ Failed to send:', res.statusCode);
  }
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(data);
req.end();
`;

  const sendPath = path.join(__dirname, 'send');
  fs.writeFileSync(sendPath, sendScript);
  fs.chmodSync(sendPath, '755');
}

// Auto-reply function
function generateAutoReply(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! 👋 I'm the Claude bot. Your message has been saved for Claude to process.";
  }
  if (lowerMsg.includes('test')) {
    return "✅ Bot is working! Message saved for Claude.";
  }
  if (lowerMsg.includes('status')) {
    return "🟢 Bot Status: Active\n📝 Messages are saved to: messages.txt\n🤖 Claude can read with: cat telegram-bot/messages.txt";
  }
  if (lowerMsg.includes('help')) {
    return "📖 Help:\n• Just type any message\n• Claude will see it in messages.txt\n• Claude responds with: ./telegram-bot/send 'message'\n• Commands: /status /clear /help";
  }
  
  // Default response
  return `✅ Message received and saved for Claude:\n"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`;
}

// Bot commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, `❌ Unauthorized! Your User ID: ${userId}`);
    return;
  }
  
  // Save chat ID for this user
  fs.writeFileSync(path.join(__dirname, 'active-chat.txt'), chatId.toString());
  
  bot.sendMessage(chatId, `
🤖 *Simple Claude Bot Active!*

• No queues, no duplicates
• Each message processed once
• Direct and simple

*Usage:*
Just type any message - it's saved for Claude

*For Claude:*
\`\`\`bash
# Read messages
cat telegram-bot/messages.txt

# Send response
./telegram-bot/send "message"
\`\`\`

Ready! Type your message...
  `, { parse_mode: 'Markdown' });
});

// Handle regular messages - process each only once
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageId = msg.message_id;
  
  if (!isAuthorized(userId)) return;
  
  // Check if already processed (prevent duplicates)
  const messageKey = `${chatId}_${messageId}`;
  if (processedMessages.has(messageKey)) {
    console.log(`⚠️ Skipping duplicate message ${messageKey}`);
    return;
  }
  
  // Mark as processed
  processedMessages.add(messageKey);
  
  // Clean up old processed messages (keep last 100)
  if (processedMessages.size > 100) {
    const entries = Array.from(processedMessages);
    processedMessages.clear();
    entries.slice(-50).forEach(e => processedMessages.add(e));
  }
  
  // Save message for Claude
  saveMessageForClaude(userId, msg.text, new Date().toISOString());
  
  // Save chat ID for responses
  fs.writeFileSync(path.join(__dirname, 'active-chat.txt'), chatId.toString());
  
  // Send auto-reply
  const reply = generateAutoReply(msg.text);
  bot.sendMessage(chatId, reply, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) return;
  
  const hasMessages = fs.existsSync(CLAUDE_MESSAGES);
  
  bot.sendMessage(chatId, `
📊 *Bot Status*

*State:* 🟢 Active
*Processed:* ${processedMessages.size} messages
*Message File:* ${hasMessages ? '📄 Available' : '📭 Empty'}
*Your ID:* \`${userId}\`
*Chat ID:* \`${chatId}\`

*For Claude:*
\`cat telegram-bot/messages.txt\`
\`./telegram-bot/send "response"\`
  `, { parse_mode: 'Markdown' });
});

// Clear command
bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) return;
  
  if (fs.existsSync(CLAUDE_MESSAGES)) {
    fs.unlinkSync(CLAUDE_MESSAGES);
  }
  processedMessages.clear();
  
  bot.sendMessage(chatId, '🗑️ Messages cleared!');
});

// Execute command
bot.onText(/\/exec (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) return;
  
  const cmd = match[1];
  
  // Security check
  const dangerous = ['rm -rf /', 'sudo rm', 'chmod 777 /', 'mkfs', ':(){'];
  if (dangerous.some(d => cmd.includes(d))) {
    bot.sendMessage(chatId, '⚠️ Command blocked for safety');
    return;
  }
  
  bot.sendMessage(chatId, `⏳ Executing: \`${cmd}\``);
  
  exec(cmd, { 
    cwd: PROJECT_PATH, 
    timeout: 30000,
    maxBuffer: 1024 * 1024
  }, (error, stdout, stderr) => {
    const output = stdout || stderr || error?.message || 'No output';
    const trimmed = output.substring(0, 3000);
    
    bot.sendMessage(chatId, `\`\`\`\n${trimmed}\n\`\`\`${output.length > 3000 ? '\n(truncated)' : ''}`, {
      parse_mode: 'Markdown'
    });
  });
});

// Help command  
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) return;
  
  bot.sendMessage(chatId, `
📖 *Simple Bot Commands*

*Messaging:*
• Just type - Saved for Claude (no duplicates)
• /status - Check bot status
• /clear - Clear saved messages

*System:*
• /exec [cmd] - Run shell command
• /help - This help message

*For Claude:*
\`\`\`bash
# Read messages
cat telegram-bot/messages.txt

# Send response  
./telegram-bot/send "text"
\`\`\`

Simple, direct, no queues!
  `, { parse_mode: 'Markdown' });
});

// Handle errors
bot.on('polling_error', (error) => {
  if (!error.message.includes('409') && !error.message.includes('terminated by other')) {
    console.error('❌ Bot error:', error.message);
  }
});

// Handle webhook errors
bot.on('webhook_error', (error) => {
  console.error('❌ Webhook error:', error.message);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  bot.stopPolling();
  process.exit(0);
});

// Initialize
createSendScript();
console.log('\n🚀 Simple Claude Bot Started!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ No queues - Direct processing');
console.log('✅ No duplicates - Each message once');
console.log('📄 Messages saved to:', CLAUDE_MESSAGES);
console.log('\n📝 Claude commands:');
console.log('  cat telegram-bot/messages.txt');
console.log('  ./telegram-bot/send "message"');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');