require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const CHANNEL_ID = "1474611756361060362";
const EMOJI = process.env.EMOJI;

let lastTweet = null;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkTwitter();
  setInterval(checkTwitter, 120000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.attachments.size === 0) return;

  try {
    await message.react(EMOJI);
  } catch (err) {
    console.log("Reaction failed:", err.message);
  }
});

async function checkTwitter() {
  try {
    const res = await fetch('https://nitter.poast.org/PriceErrors/rss');
    const text = await res.text();

    const match = text.match(/<link>(https:\/\/nitter.net\/PriceErrors\/status\/\d+)<\/link>/);
    if (!match) return;

    const tweetLink = match[1];
    if (tweetLink === lastTweet) return;

    lastTweet = tweetLink;

    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(`💰 **PriceErrors tweeted!**\n\n${tweetLink}`);

    console.log("Tweet posted:", tweetLink);

  } catch (err) {
    console.log("Twitter check failed:", err.message);
  }
}

client.login(process.env.TOKEN);