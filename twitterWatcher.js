const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

const FEED_URL = "https://nitter.net/PriceErrors/rss";
const CHANNEL_ID = "1474598322235772988";

const DATA_FILE = "./lastTweet.json";

module.exports = (client) => {

    let lastTweet = null;

    // load last saved tweet
    if (fs.existsSync(DATA_FILE)) {
        lastTweet = JSON.parse(fs.readFileSync(DATA_FILE)).id;
    }

    async function checkTwitter() {
        try {
            const feed = await parser.parseURL(FEED_URL);
            const newest = feed.items[0];

            if (!newest) return;
            if (lastTweet === newest.id) return;

            lastTweet = newest.id;
            fs.writeFileSync(DATA_FILE, JSON.stringify({ id: newest.id }));

            const channel = await client.channels.fetch(CHANNEL_ID);

            const tweetLink = newest.link;
            const text = newest.contentSnippet;

            await channel.send(`🐦 **New Tweet Posted!**\n${text}\n${tweetLink}`);

            console.log("Tweet posted:", tweetLink);

        } catch (err) {
            console.log("Twitter check error:", err.message);
        }
    }

    // checks every 30 seconds
    setInterval(checkTwitter, 30000);
};