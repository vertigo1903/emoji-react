require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const gamestopChecker = require('./gamestopChecker');

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

gamestopChecker(client);

client.login(process.env.TOKEN);