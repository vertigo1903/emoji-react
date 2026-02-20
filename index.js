require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const EMOJI = process.env.EMOJI;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// The classic reaction behavior
client.on('messageCreate', async (message) => {

  // Ignore bots (including itself)
  if (message.author.bot) return;

  // Ignore other channels
  if (message.channel.id !== CHANNEL_ID) return;

  // Only react to messages with attachments
  if (message.attachments.size > 0) {
    try {
      await message.react(EMOJI);
      console.log(`Reacted to a message in ${message.channel.id}`);
    } catch (err) {
      console.log('Failed to react:', err.message);
    }
  }
});

client.login(process.env.TOKEN);