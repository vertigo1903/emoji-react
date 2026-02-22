require("dotenv").config();
const axios = require("axios");
const Parser = require("rss-parser");
const express = require("express");

const parser = new Parser();

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const CHECK_INTERVAL = 180000; // 3 mins

const FEEDS = [
  "https://nitter.poast.org/PriceErrors/rss",
  "https://nitter.privacydev.net/PriceErrors/rss",
  "https://nitter.net/PriceErrors/rss"
];

let lastTweetLink = null;

// =====================
// KEEP RAILWAY AWAKE
// =====================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Web server running on port", PORT);
});

// =====================
// CHECK TWITTER
// =====================
async function checkTweets() {
  console.log("Checking feeds...");

  for (const feedURL of FEEDS) {
    try {
      console.log("Trying:", feedURL);

      const response = await axios.get(feedURL, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const feed = await parser.parseString(response.data);
      const latest = feed.items[0];

      if (!latest) continue;

      if (latest.link === lastTweetLink) {
        console.log("No new tweet.");
        return;
      }

      lastTweetLink = latest.link;

      await sendToWebhook(latest);
      return;

    } catch (err) {
      console.log("Feed failed:", feedURL);
    }
  }

  console.log("All feeds failed this round.");
}

// =====================
// SEND WEBHOOK
// =====================
async function sendToWebhook(tweet) {
  console.log("New tweet detected. Sending...");

  const cleanText = tweet.content
    .replace(/<[^>]*>/g, "")
    .slice(0, 1000);

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = cleanText.match(urlRegex) || [];

  const embed = {
    title: "💸 Price Error Just Posted",
    url: tweet.link,
    description: cleanText,
    color: 0x00ff99,
    fields: links.length
      ? [
          {
            name: "🔗 Product Links",
            value: links.join("\n")
          }
        ]
      : [],
    footer: {
      text: "PriceErrors Monitor"
    },
    timestamp: new Date()
  };

  await axios.post(WEBHOOK_URL, {
    embeds: [embed]
  });

  console.log("Webhook sent successfully.");
}

// =====================
// ERROR PROTECTION
// =====================
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});

// =====================
// START LOOP
// =====================
setInterval(() => {
  console.log("Interval fired.");
  checkTweets();
}, CHECK_INTERVAL);

checkTweets();