const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("currentmmr")
    .setDescription(
      "Fetches current MMR information for Valorant account by username and tag"
    )
    .addStringOption((option) => {
      return option
        .setName("username")
        .setDescription("search for player by username and tag")
        .setRequired(true);
    }),

  run: async ({ client, interaction }) => {
    try {
      const valorantUser = interaction.options.getString("username").split("#");
      const username = valorantUser[0];
      const tag = valorantUser[1];
      const url = `https://api.henrikdev.xyz/valorant/v2/mmr/na/${username}/${tag}`;

      const response = await fetch(url);
      console.log(response);
      if (response.status !== 200) {
        return interaction.editReply("User not found or cannot access user.");
      }

      let data = await response.json();
      data = data.data;
      current_data = data.current_data;
      season_data = data.by_season;
      console.log(current_data);
      console.log(season_data);

      const embed = new MessageEmbed();

      embed.setDescription(
        `**User:** ${username}#${tag}
        \n**Current Rank:** ${current_data.currenttierpatched}
        \n**Act Wins:** ${season_data.e4a3.wins}
        \n**Total Act Games:** ${season_data.e4a3.number_of_games}
        \n**Elo:** ${current_data.elo}`
      );

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (err) {
      
      throw new Error(err);
    }
  },
};
