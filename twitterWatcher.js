const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

const FEED_URL = "https://nitter.net/PriceErrors/rss";
const CHANNEL_ID = "1474598322235772988";

const DATA_FILE = "./lastTweet.json";

module.exports = (client) => {

    let lastTweet = null;

    if (fs.existsSync(DATA_FILE)) {
        lastTweet = JSON.parse(fs.readFileSync(DATA_FILE)).id;
    }

    function cleanTweet(text) {
        if (!text) return "";

        // remove extra links
        text = text.replace(/https?:\/\/\S+/g, '');

        // remove "Price Errors (@PriceErrors)" signature
        text = text.replace(/Price Errors\s*\(@PriceErrors\)/gi, '');

        // remove #ad tags
        text = text.replace(/#ad/gi, '');

        // trim whitespace
        return text.trim();
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

            const tweetLink = newest.link.replace("nitter.net", "twitter.com");
            const text = cleanTweet(newest.contentSnippet);

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setAuthor({
                    name: "Price Errors",
                    iconURL: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
                    url: tweetLink
                })
                .setTitle("💰 Price Errors just posted")
                .setDescription(text || "New deal posted!")
                .setURL(tweetLink)
                .setFooter({ text: "Click the title to view the tweet" })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            console.log("Tweet posted:", tweetLink);

        } catch (err) {
            console.log("Twitter check error:", err.message);
        }
    }

    setInterval(checkTwitter, 30000);
};