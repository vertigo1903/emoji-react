const Parser = require('rss-parser');
const parser = new Parser();

const FEED = "https://nitter.net/PriceErrors/rss";
const CHANNEL_ID = "1474611756361060362";

let lastLink = null;

module.exports = async (client) => {

  async function checkTweets() {
    try {
      const feed = await parser.parseURL(FEED);
      const tweet = feed.items[0];
      if (!tweet) return;

      if (tweet.link === lastLink) return;
      lastLink = tweet.link;

      const channel = await client.channels.fetch(CHANNEL_ID);

      const cleanText = tweet.contentSnippet
        .replace(/\n+/g, '\n')
        .replace(/https:\/\/t\.co\/\S+/g, '')
        .trim();

      await channel.send(
        `💰 **Price Errors just posted!**\n\n${cleanText}\n\n🔗 ${tweet.link}`
      );

      console.log("Tweet posted:", tweet.link);

    } catch (err) {
      console.log("Twitter check failed:", err.message);
    }
  }

  // check every 2 minutes
  setInterval(checkTweets, 120000);

  // run immediately at startup
  checkTweets();
};