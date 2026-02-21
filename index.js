require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');

const CHANNEL_ID = "1474611756361060362";
const EMOJI = "🔥"; // hard coded so it always reacts

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

let lastTweet = null;

/* READY */

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkTwitter();
  setInterval(checkTwitter, 120000);
});

/* IMAGE REACTIONS */

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;
    if (!message.attachments || message.attachments.size === 0) return;

    await message.react(EMOJI);
    console.log("Reacted to image 🔥");

  } catch (err) {
    console.log("Reaction error:", err.message);
  }
});

/* TWITTER WATCHER */

async function checkTwitter() {
  try {
    const res = await fetch('https://nitter.poast.org/PriceErrors/rss');
    const text = await res.text();

    const match = text.match(/<link>(https:\/\/nitter\.poast\.org\/PriceErrors\/status\/\d+)<\/link>/);
    if (!match) return;

    const tweetLink = match[1];
    if (tweetLink === lastTweet) return;

    lastTweet = tweetLink;

    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(`💰 **PriceErrors just posted!**\n${tweetLink}`);

    console.log("Tweet posted:", tweetLink);

  } catch (err) {
    console.log("Twitter check failed:", err.message);
  }
}

client.login(process.env.TOKEN);