require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const twitterWatcher = require('./twitterWatcher');
const gamestopChecker = require('./gamestopChecker');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const EMOJI = process.env.EMOJI;
const PANEL_CHANNEL = "1474611756361060362"; // new channel

// -------- READY --------
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // start modules
  twitterWatcher(client);
  gamestopChecker(client);

  // buttons
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('1').setLabel('1. Check Stock').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('2').setLabel('2. Check Stock').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('3').setLabel('3. Check Stock').setStyle(ButtonStyle.Success),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('4').setLabel('4. Check Stock').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('5').setLabel('5. Check Stock').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('6').setLabel('6. Check Stock').setStyle(ButtonStyle.Success),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setzip').setLabel('Set your ZIP').setStyle(ButtonStyle.Primary)
  );

  const channel = await client.channels.fetch(PANEL_CHANNEL);
  await channel.send({
    content: "**GameStop Ascended Heroes Stock Checker**",
    components: [row1, row2, row3]
  });

  // register slash command
  const commands = [
    new SlashCommandBuilder()
      .setName('setzip')
      .setDescription('Set your ZIP code for store stock checking')
      .addStringOption(option =>
        option.setName('zip')
          .setDescription('Your ZIP Code')
          .setRequired(true)
      )
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

  console.log('Stock checker ready');
});

// -------- REACTION BOT --------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

  if (message.attachments.size > 0) {
    try {
      await message.react(EMOJI);
    } catch {}
  }
});

client.login(process.env.TOKEN);