const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

dotenv.config();

// login token/key to bot
const TOKEN = process.env.TOKEN;

// check if user wants to load slash commands
const LOAD_SLASH = process.argv[2] == "load";

// DEPLOY slash commands
// client id for bot
const CLIENT_ID = "981406021664776192";

// server id that bot runs in
const GUILD_ID = "328391099032797184";

// intents chooses which events bot can listen and respond to
const client = new Discord.Client({
  intents: ["GUILDS"],
});

// creates map to store command name as key and command as value
client.slashcommands = new Discord.Collection();

const commands = [];

const slashFiles = fs.readdirSync("./commands");

// importing slash commands
for (const file of slashFiles) {
  const slashcmd = require(`./commands/${file}`);
  client.slashcommands.set(slashcmd.data.name, slashcmd);

  if (LOAD_SLASH) {
    commands.push(slashcmd.data.toJSON());
  }
}

// deploy slash commands to bot
if (LOAD_SLASH) {
  // generate URL with CLIENT_ID (bot) and GUILD_ID (server)
  const rest = new REST({
    version: "9",
  }).setToken(TOKEN);
  console.log("Deploying slash commands...");

  // deploys slash commands to the bot
  // Routes provides access to discord API endpoint and sends HTTP put request with slash commands to store it in bot in server
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded commands!");
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
    })
    // interactionCreate (event listener) listening for when user inputs slash command
    client.on('interactionCreate', (interaction) => {
        // parse the slash command
        async function handleCommand() {
            // checks that the interaction must be a valid slash command;
            if (!interaction.isCommand()) {
                return;
            }

            const slashcmd = client.slashcommands.get(interaction.commandName);
            if (!slashcmd) {
                await interaction.reply("Not a valid slash command!");
            }

            await interaction.deferReply();
            await slashcmd.run({ client, interaction });
        }
        handleCommand();
    });
    client.login(TOKEN);
}
