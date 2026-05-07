// index.js (ENTRY POINT BARU)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const keepAlive = require('./src/utils/server'); // Pastikan Tahap 2 sudah dilakukan

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ],
});

// 1. MENYIMPAN CONFIG & STATE DI CLIENT AGAR BISA DIAKSES DARI FILE MANA SAJA
client.config = {
    guildId: process.env.GUILD_ID,
    chMembers: process.env.CH_MEMBERS,
    chBots: process.env.CH_BOTS,
    chProjects: process.env.CH_PROJECTS,
    chOnline: process.env.CH_ONLINE,
    chWelcome: '1482020214479654942',
    chLogs: '1500558031501525182',
    catActiveProjects: '1500574998920695908',
    chProjectArchive: '1500575224758800495',
    ownerId: '729357135426617374',
    chAchievements: '1500568381311684680', 
    roleGuest: '1482036807460716764',
    roleResearcher: '1482035784428163175',
    roleStalker: '1482036252047052862',
    voiceGenerators: ['1482028805102239814', '1482028456228163677']
};

client.tempVoiceChannels = new Set();
client.voiceJoinTimes = new Map();
client.commands = new Collection();

// 2. JALANKAN SERVER KEEPALIVE
keepAlive();

// 3. EVENT HANDLER (Memuat otomatis semua file di src/events)
const eventsPath = path.join(__dirname, 'src', 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// 4. COMMAND HANDLER (Memuat otomatis file - sementara untuk Prefix Command)
// Nanti jika transisi ke Slash Commands, foldernya akan kita rapikan lagi
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set item baru di Collection. Key sebagai nama command, value sebagai module yang diekspor
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[⚠️ WARNING] Command di ${filePath} tidak memiliki properti "data" atau "execute".`);
        }
    }
}

// 5. LOGIN BOT
client.login(process.env.DISCORD_TOKEN).catch(console.error);