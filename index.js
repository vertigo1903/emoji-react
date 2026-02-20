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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;

  const hasImage = message.attachments.some(att =>
    att.contentType?.startsWith('image/') ||
    att.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );

  if (!hasImage) return;

  try {
    await message.react(process.env.EMOJI);
  } catch (err) {
    console.log("Couldn't react:", err.message);
  }
});

client.login(process.env.TOKEN);