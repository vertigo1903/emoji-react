const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const PRODUCTS = {
  ps5: { name: "PlayStation 5", sku: "11108140" },
  portal: { name: "PlayStation Portal", sku: "20005477" },
  controller: { name: "DualSense Controller", sku: "11108141" }
};

async function checkStock(zip, sku) {
  try {
    const res = await axios.get(`https://api.gamestop.com/stock/${sku}/${zip}`);
    return res.data.stores || [];
  } catch {
    return [];
  }
}

module.exports = (client) => {

  // send the panel once the bot starts
  client.once('ready', async () => {
    const channel = await client.channels.fetch(process.env.STOCK_CHANNEL);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ps5').setLabel('Check PS5').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('portal').setLabel('Check Portal').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('controller').setLabel('Check Controller').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: "🎮 **Stock Checker Panel**",
      components: [row]
    });

    console.log("Stock panel sent");
  });

  // button handler
  client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    const product = PRODUCTS[interaction.customId];
    if (!product) return;

    try {
      // instant reply to avoid timeout
      await interaction.reply({
        content: "Checking stock... ⏳",
        ephemeral: true
      });

      const zip = "85204";
      const stores = await checkStock(zip, product.sku);

      if (!stores.length) {
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
};