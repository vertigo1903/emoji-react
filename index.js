require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const EMOJI = process.env.EMOJI;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Only runs when a message is sent
client.on('messageCreate', async (message) => {

  // ignore bots
  if (message.author.bot) return;

  // ignore other channels (BIG optimization)
  if (message.channel.id !== CHANNEL_ID) return;

  // no attachments = ignore instantly
  if (!message.attachments.size) return;

  const file = message.attachments.first();

  // only react to images
  if (!file.contentType || !file.contentType.startsWith('image/')) return;

  try {
    await message.react(EMOJI);
  } catch (err) {
    console.log("Couldn't react:", err.message);
  }
});

client.login(process.env.TOKEN);