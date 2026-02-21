require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const twitterWatcher = require('./twitterWatcher');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const REACT_CHANNEL = "1474611756361060362"; // your channel
const EMOJI = process.env.EMOJI;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // start twitter monitor
  twitterWatcher(client);
});

// React to images
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  if (message.channel.id !== REACT_CHANNEL) return;
  if (message.attachments.size === 0) return;

  try {
    await message.react(EMOJI);
    console.log('Reacted to image');
  } catch (err) {
    console.log('Reaction failed:', err.message);
  }
});

client.login(process.env.TOKEN);