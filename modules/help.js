// @ts-check
const Augur = require("augurbot-ts"),
  Discord = require("discord.js"),
  fs = require("fs"),
  config = require("../config/config.json"),
  u = require("../utils/utils");

const miscFeatures = [
  "### SGA Translation\nClick the button under a message with Standard Galactic Alphabet to translate it to English",
  "### Bookmarking\nRight click (or tap and hold) a message and go to Apps > Bookmark to save the message for later",
  "### Mod Menu\nRight click (or tap and hold) a message and go to Apps > Mod Menu to report the message"
];

function isAvailable(command, int) {
  if (!command.enabled || command.hidden) return false; // hidden
  if (command.onlyGuild && !int.inGuild()) return false; // outside server
  if (command.guildId && command.guildId !== int.guildId) return false; // outside correct server
  if (command.userPerms && !int.inGuild()) return false; // should be in server
  if (command.userPerms && !int.memner.permissions.hasAll(command.userPerms)) return false; // no perms
  try {
    return command.permissions(int); // final check
  } catch (error) {
    return false;
  }
}

const tagButton = new u.Button()
  .setLabel("Tags")
  .setEmoji("🏷")
  .setCustomId("helpTags")
  .setStyle(Discord.ButtonStyle.Primary);

const Module = new Augur.Module()
.addInteraction({
  id: "helpTags",
  type: "Button",
  process: async (int) => {
    const tags = require("./tags").tags;
    if (tags.size === 0) return int.reply({ content: "I couldn't find any tags. Try again later!", ephemeral: true });
    const ldsg = int.client.guilds.cache.get(u.sf.ldsg);
    const embed = u.embed({ author: int.client.user })
      .setTitle(`Custom Tags in ${ldsg?.name ?? "LDS Gamers"}`)
      .setURL("https://my.ldsgamers.com/commands")
      .setThumbnail(ldsg?.iconURL() ?? null);
    const mapped = tags.map(t => `${config.prefix}${u.escapeText(t.tag)}`);
    u.pagedEmbeds(int, embed, mapped, true);
  }
})
.addInteraction({
  id: u.sf.commands.slashHelp,
  options: { registry: "slashHelp" },
  process: async (int) => {
    const embed = u.embed().setTitle("Icarus Commands")
      .setDescription("These are all the commands availabe in LDS Gamers.")
      .setURL("https://my.ldsgamers.com/commands")
      .setThumbnail(int.client.user?.displayAvatarURL() || null);
    const oldCmds = [];
    const commands = [...Module.client.commands.values()].concat(oldCmds)
      .filter(c => isAvailable(c, int))
      .map(c => {
        let str = `### ${config.prefix}${c.name}`;
        if (c.aliases.length > 0) str += `\n(AKA ${c.aliases.join("\n")})`;
        if (c.description) str += `\n${c.description}`;
        if (c.syntax) str += `\nSyntax: ${config.prefix}${c.name} ${c.syntax}`;
        return str;
      });

    const ints = Module.client.interactions.filter(c => c.type === "CommandSlash" && isAvailable(c, int))
      .map(i => {
        const reg = i.options?.registry;
        if (!reg || !fs.existsSync(`registry/${reg}.js`)) return [];
        const file = require(`../registry/${reg}`);
        const { name } = file;
        const cmds = [cmd(file, "")];
        for (const option of file.options) {
          if (option.type === 2) { // subcommand group
            option.options.forEach(o => cmds.push(cmd(o, name, option)));
          } else if (option.type === 1) { // subcommand
            cmds.push(cmd(option, name));
          }
        }
        return cmds.map(c => `${c.name}\n${c.description}\n`).sort((a, b) => a.localeCompare(b));
      })
      .filter(i => i.length > 0)
      .flat();

    await u.pagedEmbeds(int, embed, ints.concat(commands).concat(miscFeatures), true);
    await int.followUp({ components: [u.MessageActionRow().addComponents(tagButton)], ephemeral: true });
  }
});


function cmd(op, baseName = "", group) {
  let name = baseName ? `### /${baseName} ` : "## /";
  if (group) name += `${group.name} `;
  name += op.name;
  const descriptionLines = [op.description];
  for (const option of op.options || []) {
    if ([1, 2].includes(option.type)) continue;
    name += ` [${option.name}]`;
    descriptionLines.push(`${option.name}: ${option.description}`);
  }
  return { name, description: descriptionLines.join("\n") };
}


module.exports = Module;