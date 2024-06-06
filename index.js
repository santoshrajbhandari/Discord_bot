require('dotenv').config();//uncomment this for hosting bot

const { Client, GatewayIntentBits } = require('discord.js');
// Your bot setup and logic here

const { handleRoleAssignment } = require('./roleAssignments');
const { checkExpirations } = require('./expirationChecker');
const { handleCommand } = require('./commandHandler');
const config = require('./config.json');

// Load environment variables
const token = process.env.token;//uncomment this for hosting bot

// Create a new client instance with the necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
    // Check expirations on startup
    checkExpirations(client);
    // Check expirations periodically (e.g., every day)
    setInterval(() => checkExpirations(client), 24 * 60 * 60 * 1000);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        await handleRoleAssignment(oldMember, newMember);
    } catch (error) {
        console.error('Error handling role assignment:', error);
    }
});

client.on('messageCreate', async (message) => {
    try {
        await handleCommand(client, message);
    } catch (error) {
        console.error('Error handling command:', error);
    }
}) 
// Log in to Discord with your bot token
client.login(token);//remove config for hosting bot
