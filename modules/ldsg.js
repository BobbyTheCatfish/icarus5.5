// @ts-check

const Augur = require("augurbot-ts"),
  u = require("../utils/utils"),
  Discord = require("discord.js"),
  { ButtonStyle } = require("discord.js");

/**
 * Responds with the number of guild members, and how many are online.
 * @param {Discord.ChatInputCommandInteraction} interaction The interaction that the user submits.
 */
async function slashLdsgMembers(interaction) {
  try {
    const ldsg = interaction.client.guilds.cache.get(u.sf.ldsg);
    if (!ldsg) throw new Error("Couldn't find LDSG");
    const online = ldsg.members.cache.filter((member) => member?.presence && member.presence.status != "offline");
    const response = `📈 **Members:**\n${ldsg.memberCount} Members\n${online.size} Online`;
    await interaction.reply({ content: response });
  } catch (error) { u.errorHandler(error, interaction); }
}

const sendOptions = [
  u.MessageActionRow().setComponents([
    new u.Button().setCustomId("pa").setEmoji("🗣️").setLabel("Public Affairs").setStyle(ButtonStyle.Primary),
    new u.Button().setCustomId("log").setEmoji("🚚").setLabel("Logistics").setStyle(ButtonStyle.Primary),
    new u.Button().setCustomId("ops").setEmoji("🕵️").setLabel("Operations").setStyle(ButtonStyle.Primary),
    new u.Button().setCustomId("icarus").setEmoji("🐤").setLabel("Icarus").setStyle(ButtonStyle.Primary),
])];

const replyOption = [
  u.MessageActionRow().setComponents([
    new u.Button().setCustomId("reply").setEmoji("🗨️").setLabel("Reply to user").setStyle(ButtonStyle.Primary)
  ])
];

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashLdsgSuggest(int) {
  const suggestion = int.options.getString("suggestion", true);
  await int.deferReply({ ephemeral: true });
  const embed = u.embed({ author: int.user })
    .addFields({name: "User ID:", value: int.user.id }, { name: "Suggestion:", value: suggestion });
  await int.client.getTextChannel(u.sf.channels.suggestionBox)?.send({ embeds: [embed], components: sendOptions });
  int.editReply("Sent!");
  return int.user.send({ content: "Sent:", embeds: [embed] });
}

/** @param {Discord.ButtonInteraction<"cached">} int */
async function processCardAction(int) {
  try {
    const suggestion = int.message;
    const embed = u.embed(suggestion.embeds[0]);
    switch (int.customId) {
      case "pa":
        // int.client.getTextChannel(u.sf.channels.publicaffairs)?.send({ embeds: suggestion.embeds });
        embed.addFields({ name: `Sent to Public Affairs`, value: `by ${int.user}`});
        int.client.getForumChannel(u.sf.channels.publicaffairsForum)?.threads.create({ name: `Suggestion from ${suggestion.embeds[0].author?.name}`, message: {embeds: [suggestion.embeds[0]], components: replyOption} });
        return int.update({ embeds: [embed], components: [] });
      case "log":
        // int.client.getTextChannel(u.sf.channels.logistics)?.send({ embeds: suggestion.embeds });
        embed.addFields({ name: `Sent to Logistics`, value: `by ${int.user}`});
        int.client.getForumChannel(u.sf.channels.logisticsForum)?.threads.create({ name: `Suggestion from ${suggestion.embeds[0].author?.name}`, message: {embeds: [suggestion.embeds[0]], components: replyOption} });
        return int.update({ embeds: [embed], components: [] });
      case "ops":
        // int.client.getTextChannel(u.sf.channels.operations)?.send({ embeds: suggestion.embeds });
        embed.addFields({ name: `Sent to Operations`, value: `by ${int.user}`});
        int.client.getForumChannel(u.sf.channels.operationsForum)?.threads.create({ name: `Suggestion from ${suggestion.embeds[0].author?.name}`, message: {embeds: [suggestion.embeds[0]], components: replyOption} });
        return int.update({ embeds: [embed], components: [] });
      case "icarus":
        // int.client.getTextChannel(u.sf.channels.bottesting)?.send({ embeds: suggestion.embeds });
        embed.addFields({ name: `Sent to Icarus Developers`, value: `by ${int.user}`});
        int.client.getForumChannel(u.sf.channels.bottestingForums)?.threads.create({ name: `Suggestion from ${suggestion.embeds[0].author?.name}`, message: {embeds: [suggestion.embeds[0]], components: replyOption} });
        return int.update({ embeds: [embed], components: [] });
      case "reply":
        const modal = new u.Modal().addComponents(
          u.ModalActionRow().addComponents([
            new u.TextInput()
              .setCustomId("text")
              .setLabel("Reply")
              .setStyle(Discord.TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder("Your reply for the user")
          ])
        ).setCustomId("suggestionReply").setTitle("Suggestion Reply");
        await int.showModal(modal);
        const submitted = await int.awaitModalSubmit({ time: 5 * 60 * 1000, dispose: true }).catch(() => {
          return null;
        });
        if (!submitted) {
          return int.channel?.send("I fell asleep waiting for your input...");
        }
        await submitted.deferUpdate();
        let reply = submitted.fields.getTextInputValue("text");
        const em = u.embed({ author: int.user })
          .setTitle("Suggestion feedback")
          .addFields({ name: "Reply:", value: reply });
          console.log(suggestion.embeds[0].fields)
          console.log(suggestion.embeds[0].fields.find(field => field.name == "User ID:")?.value);
          const member = int.guild.members.cache.get(suggestion.embeds[0].fields.find(field => field.name === "User ID:")?.value ?? "");
          if (!member) {
            return int.channel?.send("I could not find that member");
          }
          try {
            member.send({embeds: [em]});
            return int.channel?.send({content: "Replied to user:", embeds: [em] });
          } catch (e) {
            u.errorHandler(e, int);
            return int.channel?.send("Failed to message member, they may have me blocked. You will need to reach out to them on your own this time!");
          }
    }
  } catch (e) { u.errorHandler(e, int); }
}

const Module = new Augur.Module()
  .addInteraction({
    name: "ldsg",
    id: u.sf.commands.slashLdsg,
    process: async (interaction) => {
      const subcommand = interaction.options.getSubcommand(true);
      switch (subcommand) {
        case "members": return slashLdsgMembers(interaction);
        case "suggest": return slashLdsgSuggest(interaction);
      }
    }
  })
  .addEvent("interactionCreate", (int) => {
    if (!int.inCachedGuild() || !int.isButton() || int.guild.id != u.sf.ldsg) return;
    if (!u.perms.calc(int.member, ["team"])) {
      return int.reply({ content: "You don't have permissions to interact with this suggestion!", ephemeral: true });
    }
    if (['pa', 'log', 'ops', 'icarus', 'reply']
      .includes(int.customId)) return processCardAction(int);
  });

module.exports = Module;

