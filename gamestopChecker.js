const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

const userZips = new Map();

const PRODUCTS = {
  "1": { name: "2 Pack Blister", sku: "437070" },
  "2": { name: "Elite Trainer Box", sku: "437099" },
  "3": { name: "3 Pack Blister", sku: "437098" },
  "4": { name: "Booster Bundle", sku: "200461" },
  "5": { name: "Poster Collection", sku: "200462" },
  "6": { name: "Mini Tins", sku: "200460" },
};

async function checkStock(zip, sku) {
  const url = `https://www.gamestop.com/api/stores/availability?sku=${sku}&zip=${zip}&radius=50`;

  try {
    const res = await axios.get(url);
    return res.data.stores || [];
  } catch (err) {
    console.log("GameStop API error:", err.message);
    return null;
  }
}

module.exports = function (client) {

  client.on('interactionCreate', async interaction => {

    // slash command
    if (interaction.isChatInputCommand() && interaction.commandName === 'setzip') {
      const zip = interaction.options.getString('zip');
      userZips.set(interaction.user.id, zip);
      return interaction.reply({ content: `📍 ZIP set to ${zip}`, ephemeral: true });
    }

    // buttons
    if (!interaction.isButton()) return;

    const product = PRODUCTS[interaction.customId];
    if (!product) return;

    const zip = userZips.get(interaction.user.id);
    if (!zip)
      return interaction.reply({ content: "Use /setzip first", ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

    const stores = await checkStock(zip, product.sku);

    if (!stores || stores.length === 0)
      return interaction.editReply("❌ No stock found nearby");

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(`🛒 ${product.name}`)
      .setDescription(
        stores.slice(0,10).map(s =>
          `**${s.storeName}** — ${s.quantity} available`
        ).join("\n")
      );

    interaction.editReply({ embeds: [embed] });
  });

};