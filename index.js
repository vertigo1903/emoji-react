require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');

const parser = new Parser();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = "1474611756361060362";
let lastTweet = null;

/* READY */

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkTweets();
  setInterval(checkTweets, 120000);
});

/* IMAGE REACTIONS */

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.attachments.size === 0) return;

  try {
    await message.react("🔥");
    console.log("Reacted to image");
  } catch (err) {
    console.log("Reaction failed:", err.message);
  }
});

/* TWITTER WATCHER */

async function checkTweets() {
  try {
    const feed = await parser.parseURL("https://nitter.poast.org/PriceErrors/rss");
    const newest = feed.items[0]?.link;
    if (!newest || newest === lastTweet) return;

    lastTweet = newest;

    const channel = await client.channels.fetch(CHANNEL_ID);
    channel.send(`💰 **PriceErrors just posted!**\n${newest}`);

    console.log("Tweet sent:", newest);

  } catch (err) {
    console.log("Twitter error:", err.message);
  }
}

client.login(process.env.TOKEN);