import TelegramBot from 'node-telegram-bot-api'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Configuration
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const AUTHORIZED_USERS = (process.env.TELEGRAM_AUTHORIZED_USERS || '').split(',').map(id => parseInt(id))
const PROJECT_PATH = process.env.PROJECT_PATH || '/Volumes/DATA/dev/supover-vibe'

// Create bot instance
const bot = new TelegramBot(TOKEN, { polling: true })
const execAsync = promisify(exec)

// Session storage for Claude interactions
interface Session {
  userId: number
  context: string
  lastCommand?: string
  awaitingResponse?: boolean
  claudeQuestion?: string
}

const sessions: Map<number, Session> = new Map()

// Logging
const log = (message: string) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`)
}

// Authorization check
const isAuthorized = (userId: number): boolean => {
  return AUTHORIZED_USERS.includes(userId)
}

// Send long messages in chunks
const sendLongMessage = async (chatId: number, text: string, options: any = {}) => {
  const maxLength = 4000
  if (text.length <= maxLength) {
    return bot.sendMessage(chatId, text, options)
  }

  const chunks = []
  let currentChunk = ''
  const lines = text.split('\n')

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLength) {
      chunks.push(currentChunk)
      currentChunk = line
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line
    }
  }
  if (currentChunk) chunks.push(currentChunk)

  for (const chunk of chunks) {
    await bot.sendMessage(chatId, chunk, options)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Command handlers
const commands = {
  start: async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) {
      return bot.sendMessage(chatId, '❌ Unauthorized. Your user ID has been logged.')
    }

    const welcomeMessage = `
🤖 *Claude Terminal Bot Active*

You can now control your terminal remotely!

*Available Commands:*
/status - Check system status
/pwd - Show current directory
/ls - List files in current directory
/exec [command] - Execute a shell command
/claude [prompt] - Send prompt to Claude
/npm [command] - Run npm commands
/git [command] - Run git commands
/logs - Show recent logs
/help - Show this help message

*Security:* Only authorized users can use this bot.
Your User ID: \`${userId}\`
    `

    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
    
    sessions.set(userId, {
      userId,
      context: PROJECT_PATH,
    })
  },

  status: async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    try {
      const [diskSpace, memory, processes] = await Promise.all([
        execAsync('df -h /'),
        execAsync('free -h'),
        execAsync('ps aux | head -10')
      ])

      const status = `
📊 *System Status*

*Disk Space:*
\`\`\`
${diskSpace.stdout}
\`\`\`

*Memory:*
\`\`\`
${memory.stdout}
\`\`\`

*Project:* ${PROJECT_PATH}
*Node Version:* ${process.version}
*Uptime:* ${Math.floor(process.uptime() / 60)} minutes
      `

      await bot.sendMessage(chatId, status, { parse_mode: 'Markdown' })
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error: ${error}`)
    }
  },

  pwd: async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const session = sessions.get(userId)
    await bot.sendMessage(chatId, `📁 Current directory:\n\`${session?.context || PROJECT_PATH}\``, {
      parse_mode: 'Markdown'
    })
  },

  ls: async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    try {
      const session = sessions.get(userId)
      const dir = session?.context || PROJECT_PATH
      const files = await fs.readdir(dir)
      
      const fileList = files.slice(0, 30).join('\n')
      const message = `📂 *Files in ${path.basename(dir)}:*\n\`\`\`\n${fileList}\n\`\`\``
      
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
      
      if (files.length > 30) {
        await bot.sendMessage(chatId, `... and ${files.length - 30} more files`)
      }
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error: ${error}`)
    }
  },

  exec: async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const command = match?.[1]
    if (!command) {
      return bot.sendMessage(chatId, '❌ Please provide a command: /exec [command]')
    }

    // Safety check for dangerous commands
    const dangerousCommands = ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot']
    if (dangerousCommands.some(cmd => command.includes(cmd))) {
      return bot.sendMessage(chatId, '⚠️ Dangerous command blocked for safety!')
    }

    try {
      await bot.sendMessage(chatId, `⏳ Executing: \`${command}\``, { parse_mode: 'Markdown' })
      
      const session = sessions.get(userId)
      const cwd = session?.context || PROJECT_PATH
      
      const { stdout, stderr } = await execAsync(command, { 
        cwd,
        timeout: 30000 // 30 second timeout
      })

      const output = stdout || stderr || 'Command completed with no output'
      await sendLongMessage(chatId, `✅ *Output:*\n\`\`\`\n${output.slice(0, 3000)}\n\`\`\``, {
        parse_mode: 'Markdown'
      })

      // Update last command
      if (session) {
        session.lastCommand = command
        sessions.set(userId, session)
      }
    } catch (error: any) {
      await bot.sendMessage(chatId, `❌ Error executing command:\n\`\`\`\n${error.message}\n\`\`\``, {
        parse_mode: 'Markdown'
      })
    }
  },

  npm: async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const npmCommand = match?.[1]
    if (!npmCommand) {
      return bot.sendMessage(chatId, '❌ Please provide an npm command: /npm [command]')
    }

    const fullCommand = `npm ${npmCommand}`
    commands.exec(msg, [fullCommand, fullCommand])
  },

  git: async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const gitCommand = match?.[1]
    if (!gitCommand) {
      return bot.sendMessage(chatId, '❌ Please provide a git command: /git [command]')
    }

    const fullCommand = `git ${gitCommand}`
    commands.exec(msg, [fullCommand, fullCommand])
  },

  claude: async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const prompt = match?.[1]
    if (!prompt) {
      return bot.sendMessage(chatId, '❌ Please provide a prompt: /claude [prompt]')
    }

    // Store Claude interaction
    const session = sessions.get(userId)
    if (session) {
      session.claudeQuestion = prompt
      session.awaitingResponse = true
      sessions.set(userId, session)
    }

    await bot.sendMessage(chatId, `
🤖 *Claude Interaction*

Your prompt will be sent to Claude. I'll notify you when Claude responds or needs your input.

*Prompt:* ${prompt}

Use /response [your answer] to respond to Claude's questions.
    `, { parse_mode: 'Markdown' })

    // Here you would integrate with Claude's API
    // For now, we'll simulate it
    log(`Claude prompt from user ${userId}: ${prompt}`)
  },

  response: async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    const response = match?.[1]
    if (!response) {
      return bot.sendMessage(chatId, '❌ Please provide a response: /response [your answer]')
    }

    const session = sessions.get(userId)
    if (!session?.awaitingResponse) {
      return bot.sendMessage(chatId, '❌ No pending Claude question to respond to.')
    }

    // Process response
    session.awaitingResponse = false
    sessions.set(userId, session)

    await bot.sendMessage(chatId, `✅ Response sent to Claude: "${response}"`, {
      parse_mode: 'Markdown'
    })

    log(`User ${userId} responded to Claude: ${response}`)
  },

  logs: async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id
    const userId = msg.from?.id || 0

    if (!isAuthorized(userId)) return

    try {
      const logs = await execAsync('tail -n 50 /var/log/system.log 2>/dev/null || journalctl -n 50 --no-pager 2>/dev/null || echo "No logs available"')
      
      await sendLongMessage(chatId, `📜 *Recent Logs:*\n\`\`\`\n${logs.stdout.slice(0, 3000)}\n\`\`\``, {
        parse_mode: 'Markdown'
      })
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error fetching logs: ${error}`)
    }
  },

  help: async (msg: TelegramBot.Message) => {
    commands.start(msg)
  }
}

// Register command handlers
bot.onText(/\/start/, commands.start)
bot.onText(/\/status/, commands.status)
bot.onText(/\/pwd/, commands.pwd)
bot.onText(/\/ls/, commands.ls)
bot.onText(/\/exec (.+)/, commands.exec)
bot.onText(/\/npm (.+)/, commands.npm)
bot.onText(/\/git (.+)/, commands.git)
bot.onText(/\/claude (.+)/, commands.claude)
bot.onText(/\/response (.+)/, commands.response)
bot.onText(/\/logs/, commands.logs)
bot.onText(/\/help/, commands.help)

// Handle inline keyboard callbacks
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message
  const userId = callbackQuery.from.id
  const data = callbackQuery.data

  if (!msg || !isAuthorized(userId)) return

  await bot.answerCallbackQuery(callbackQuery.id)

  // Handle different callback actions
  if (data?.startsWith('approve:')) {
    await bot.sendMessage(msg.chat.id, '✅ Approved!')
  } else if (data?.startsWith('reject:')) {
    await bot.sendMessage(msg.chat.id, '❌ Rejected!')
  }
})

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

// Notification function for Claude questions
export const notifyClaudeQuestion = async (question: string, context?: string): Promise<string | null> => {
  for (const userId of AUTHORIZED_USERS) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: 'approve:claude' },
          { text: '❌ Reject', callback_data: 'reject:claude' }
        ],
        [
          { text: '💬 Provide Custom Response', callback_data: 'custom:claude' }
        ]
      ]
    }

    await bot.sendMessage(userId, `
🤖 *Claude is asking:*

${question}

${context ? `*Context:*\n${context}` : ''}

Please respond using the buttons below or use:
/response [your answer]
    `, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  }

  // Wait for response (with timeout)
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), 300000) // 5 minute timeout
  })
}

// Start the bot
console.log('🤖 Telegram bot is running...')
console.log('Authorized users:', AUTHORIZED_USERS)

// Export bot instance for use in other modules
export default bot