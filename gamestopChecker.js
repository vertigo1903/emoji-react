const axios = require('axios');
const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const CHANNEL_ID = "1474611756361060362";

const PRODUCTS = {
  "1": { name: "2 Pack Blister", sku: "437070" },
  "2": { name: "Elite Trainer Box", sku: "437099" },
  "3": { name: "3 Pack Blister", sku: "437098" },
  "4": { name: "Booster Bundle", sku: "200461" },
  "5": { name: "Poster Collection", sku: "200462" },
  "6": { name: "Mini Tins", sku: "200460" }
};

async function checkStock(zip, sku) {
  const url = `https://www.gamestop.com/api/stores/availability?sku=${sku}&zip=${zip}&radius=50`;

  try {
    const res = await axios.get(url);
    return res.data.stores || [];
  } catch (err) {
    console.log("API error:", err.message);
    return null;
  }
}

module.exports = function (client) {

  client.once('ready', async () => {

    const channel = await client.channels.fetch(CHANNEL_ID);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("1").setLabel("2 Pack").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("2").setLabel("ETB").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("3").setLabel("3 Pack").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("4").setLabel("Booster Bundle").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("5").setLabel("Poster").setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: "Select a product to check stock:",
      components: [row]
    });

    console.log("Buttons sent.");
  });

 client.on('interactionCreate', async interaction => {

  if (!interaction.isButton()) return;

  const product = PRODUCTS[interaction.customId];
  if (!product) return;

  try {

    // 👇 INSTANT reply so Discord never times out
    await interaction.reply({
      content: "Checking stock... ⏳",
      ephemeral: true
    });

    const zip = "85204"; // change if needed

    const stores = await checkStock(zip, product.sku);

    if (!stores || stores.length === 0) {
      return interaction.editReply("No stock found nearby.");
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(product.name)
      .setDescription(
        stores.slice(0, 10).map(s =>
          `**${s.storeName}** — ${s.quantity} available`
        ).join("\n")
      );

    await interaction.editReply({ content: "", embeds: [embed] });

  } catch (err) {
    console.error(err);

    if (interaction.replied)
      await interaction.editReply("Something broke.");
  }

});