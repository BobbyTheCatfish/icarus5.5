// @ts-check
const Augur = require("augurbot-ts"),
  Discord = require("discord.js"),
  u = require("../utils/utils"),
  axios = require('axios'),
  Jimp = require('jimp'),
  profanityFilter = require("profanity-matcher"),
  buttermelonFacts = require('../data/buttermelonFacts.json').facts,  
  emojiKitchenSpecialCodes = require("../data/emojiKitchenSpecialCodes.json"),
  emojilib = require('node-emoji'),
  mineSweeperEmojis = ['0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '💣'];

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunColor(int) {
  // get input or random color
  const colorCode = int.options.getString("color") || "#" + Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  // In the case that we have a string in 0xABCDEF format
  let colorCSS = colorCode.replace('0x', "#");
  try {
    if (!["#000000", "black", "#000000FF"].includes(colorCSS)) colorCSS = Jimp.cssColorToHex(colorCSS).toString();
    // make sure it is a valid color, and not just defaulting to black
    if (colorCSS == "255") {
      return int.editReply(`sorry, I couldn't understand the color ${colorCode}`);
    }
    // make and send the image
    const img = new Jimp(256, 256, colorCSS);
    return int.editReply({ files: [await img.getBufferAsync(Jimp.MIME_JPEG)] });
  } catch (error) {
    return int.editReply(`Sorry, I couldn't understand the color \`${colorCode}\``);
  }
}

// global hbs stuff
const hbsValues = {
  'Buttermelon': { emoji: `<:buttermelon:${u.sf.emoji.buttermelon}>`, beats: "Handicorn", looses: "Sloth" },
  'Handicorn': { emoji: `<:handicorn:${u.sf.emoji.handicorn}>`, beats: "Sloth", looses: "Buttermelon" },
  'Sloth': { emoji: `<:slothmare:${u.sf.emoji.slothmare}>`, beats: "Buttermelon", looses: "Handicorn" } // this is global so it don't need to be in snowflakes
};
let storedChooser = '';
let storedChoice = '';

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunHBS(int) {
  const mode = int.options.getString("mode") || "user";
  const choice = int.options.getString("choice", true);
  const chooser = int.user.toString();
  const botLobby = int.client.getTextChannel(u.sf.channels.botspam);
  switch (mode) {
    case ("user"):
      if (!storedChoice) {
        storedChooser = chooser;
        storedChoice = choice;
        int.reply({ content: `Your fighter has been picked! ${int.channelId != u.sf.channels.botspam ? `Check ${botLobby} to see the results!` : ""}`, ephemeral: true });
        return botLobby?.send("## Handicorn, Buttermelon, Sloth, Fight!\n" +
        `${chooser} has chosen their fighter and is awaiting a challenger.`);
      } else if (storedChooser == chooser) {
        storedChoice = choice;
        int.reply({ content: `Your fighter has been updated! ${int.channelId != u.sf.channels.botspam ? `Check ${botLobby} to see the results!` : ""}`, ephemeral: true });
        return botLobby?.send("## Handicorn, Buttermelon, Sloth, Fight!\n" +
        `${chooser} has changed their fighter and is awaiting a challenger.`
        );
      } else {
        const oldstoredChooser = storedChooser;
        const olcstoredChoice = storedChoice;
        storedChooser = '';
        storedChoice = '';
        return int.reply({ content:"## Handicorn, Buttermelon, Sloth, Fight!\n" +
          `🥊 ${chooser} challenged ${oldstoredChooser}!\n` +
          hbsResult(chooser, choice, oldstoredChooser, olcstoredChoice),
        allowedMentions: { parse: ["users"] } });
      }
    default: {
      const aiChoice = u.rand(Object.keys(hbsValues));
      return int.reply("## Handicorn, Buttermelon, Sloth, Fight!\n" +
      `🥊 ${chooser} challenged Icarus!\n` +
      hbsResult(chooser, choice, "Icarus", aiChoice));
    }
  }
  /**
 * function hbsResult
 * @param {string} chooser1 a string to represent who made choice 1
 * @param {string} choice1 chooser1's "Handicorn", "Buttermelon", or "Sloth" choice
 * @param {string} chooser2 ...
 * @param {string} choice2 ...
 * @return {string} a summary including who picked what and who won.
 */
  function hbsResult(chooser1, choice1, chooser2, choice2) {
    let response = `🤼 ${chooser1} picked ${hbsValues[choice1].emoji}, ${chooser2} picked ${hbsValues[choice2].emoji}.\n### `;
    if (choice1 == choice2) {
      response += "🤝 It's a tie!";
    } else if (hbsValues[choice1].beats == choice2) {
      response += `🏆 ${chooser1} wins!`;
    } else {
      response += `😵‍💫 ${chooser1} looses!`;
    }
    return response;
  }
}
/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunAcronym(int) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const len = int.options.getInteger("length") || Math.floor(Math.random() * 3) + 3;
  const pf = new profanityFilter();
  let wordgen = [];

  for (let ignored = 0; ignored < len * len; ignored++) {// try a bunch of times
    for (let i = 0; i < len; i++) {
      wordgen.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    const word = wordgen.join("");

    if (pf.scan(word.toLowerCase()).length == 0) {
      return int.editReply(`I've always wondered what __**${word}**__ stood for...`);
    } else {
      wordgen = [];
    }
  }
  return int.editReply("I've always wondered what __**IDUTR**__ stood for...");// cannonically it hearby stands for "IDiUT eRror"
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunMinesweeper(int) {
  let edgesize, mineCount, preclickCount;
  switch (int.options.getString("difficulty", true)) {
    case "Hard":
      edgesize = [10, 18];
      mineCount = 60;
      preclickCount = 6;
      break;
    case "Medium":
      edgesize = [10, 10];
      mineCount = 30;
      preclickCount = 4;
      break;
    default:
      edgesize = [5, 5];
      mineCount = 5;
      preclickCount = 4;
      break;
  }
  // override with manual numbers if given
  edgesize[0] = int.options.getInteger("width") || edgesize[0];
  edgesize[1] = int.options.getInteger("height") || edgesize[1];
  mineCount = int.options.getInteger("minecount") || mineCount;
  preclickCount = int.options.getInteger("preclickcount") || preclickCount;
  // x and y lengths (for mobile users)
  const [width, height] = edgesize;
  preclickCount = Math.min(width * height, preclickCount);
  mineCount = Math.min(width * height - preclickCount, mineCount);
  // Create a 2d array for the board
  const board = new Array(height).fill([]).map(() => {return new Array(width).fill(0);});
  // Convert the 2d array to a 2d index array. Filter corner spots.
  // const rows = board.map((c, y) => y);
  const spaces = board.map((r, y) => {
    const row = new Array(width + 1);
    row[0] = y;
    r.forEach((space, x) => {row[x + 1] = x;});
    return row;
  });
  // console.log(mineCount);
  // console.log(preclickCount);
  // console.log(board);
  // console.log(spaces);
  for (let i = 0; i < mineCount; i++) {
    // console.log("mine");
    // console.log(spaces);
    // Get a random position
    const rownum = Math.floor(Math.random() * spaces.length);
    const row = spaces[rownum];
    const y = row[0];
    const slotnum = Math.floor(Math.random() * (row.length - 1)) + 1;
    const x = row[slotnum];
    // Set the value to a mine
    board[y][x] = 9;
    // Remove from possible mine spaces
    row.splice(slotnum, 1);
    if (row.length == 1) {
      spaces.splice(rownum, 1);
    }
    // Increment all spots around it
    for (let incrementx = Math.max(0, x - 1); incrementx < Math.min(width, x + 2); incrementx++) {
      for (let incrementy = Math.max(0, y - 1); incrementy < Math.min(height, y + 2); incrementy++) {
        // if (incrementx >= width || incrementx < 0 || incrementy >= height || incrementy < 0) continue;
        board[incrementy][incrementx]++;
      }
    }
  }
  // console.log(mineCount);
  // console.log(preclickCount);
  // console.log(board);
  // console.log(spaces);
  for (let i = 0; i < preclickCount; i++) {
    // console.log("click");
    // console.log(spaces);
    // Get a random position
    const rownum = Math.floor(Math.random() * spaces.length);
    const row = spaces[rownum];
    const y = row[0];
    const slotnum = Math.floor(Math.random() * (row.length - 1)) + 1;
    const x = row[slotnum];
    // expose it
    board[y][x] = -1 - board[y][x];
    // Remove from non-special-spaces
    row.splice(slotnum, 1);
    if (row.length == 1) {
      spaces.splice(rownum, 1);
    }
  }
  // console.log(mineCount);
  // console.log(preclickCount);
  // console.log(board);
  // console.log(spaces);
  // seperate into rows and emojify and hide if not exposed
  const rowStrings = board.map(row => row.map(num => num < 0 ? mineSweeperEmojis[-num - 1] : `||${mineSweeperEmojis[Math.min(num, 9)]}||`).join(""));
  if (!int.channel) {
    return int.editReply(`I can't figure out where to put the board in here, try again in another channel like <#${u.sf.channels.botspam}>`);
  }
  int.editReply(`**Mines: ${mineCount}**`);
  const messages = [""];
  let messageCount = 0;
  let tagpairs = 0;
  rowStrings.forEach((row) => {
    if (tagpairs + (width * 2) > 199) {
      tagpairs = 0;
      messageCount++;
      messages[messageCount] = "";
    }
    tagpairs += width * 2;
    messages[messageCount] += row + "\n";
  });
  let ret;
  messages.forEach((content) => {
    ret = int.channel?.send(content);
  });
  return ret;
}
/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunRoll(int) {
  // get inputs
  const dice = int.options.getInteger('dice') || 1;
  const sides = int.options.getInteger('sides') || 6;
  const modifier = int.options.getInteger('modifier') || 0;
  if (dice > 10000) {
    return int.reply({ content: "I'm not going to roll *that* many dice... 🙄", ephemeral: true });
  }
  // calculate rolls
  /** @type {number[]} */
  const rolls = [];
  for (let i = 0; i < dice; i++) {
    rolls.push(Math.ceil(Math.random() * sides));
  }
  const total = rolls.reduce((p, c) => p + c, 0) + modifier;
  let rollStr = "";
  const maxShown = 20;
  if (rolls.length > maxShown + 3) {
    const extra = rolls.length - maxShown;
    const reduced = rolls.filter((r, i) => i < maxShown);
    rollStr = `${reduced.join(", ")}, + ${extra} more`;
  } else {
    rollStr = rolls.join(", ");
  }
  const modStr = modifier > 0 ? `+${modifier}` : modifier ? modifier : "";
  const summary = `${rollStr ? ` (**1d${sides}**: ${rollStr})` : ""} ${modStr}`;
  return int.reply(`You rolled ${dice}d${sides}${modStr} and got \`${total}\`!\n ${summary}`);
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFun8ball(int) {
  const question = int.options.getString("question", true);
  if (!question.endsWith("?")) {
    return int.reply({ content: "You need to ask me a question, silly.", ephemeral: true });
  }
  const outcomes = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes - definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    // the following were removed due to complaints
    // "Reply hazy, try again.",
    // "Ask again later.",
    // "Better not tell you now.",
    // "Cannot predict now.",
    // "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
  ];
  return int.reply(`You asked :"${question}"\n` +
    "The 8ball replies:\n" +
    u.rand(outcomes));
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunRepost(int) {
  if (!int.channel) {
    return int.reply({ content: "I don't know where here is, so I can't find anything to repost... try in a more normal channel.", ephemeral: true });
  }
  await int.deferReply();
  const latest = (await int.channel.messages.fetch({ limit: 100 })).filter(m => m.attachments.size > 0 || m.embeds.some(embed => embed.image || embed.video)).first();
  if (!latest) {
    return int.editReply("I couldn't find anything in the last 100 messages to repost.");
  }
  return int.editReply({
    content: '🚨🚨🚨 Repost alert! repost alert! 🚨🚨🚨',
    files: latest.attachments.map(a => a.url),
    embeds: latest.embeds.filter(embed => embed.image || embed.video)
  });
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunButtermelon(int) {
  return int.reply(`🍌 ${u.rand(buttermelonFacts)}`);
}

/** @param {Discord.Message|Discord.PartialMessage} msg */
function buttermelonEdit(msg) {
  if (msg.channel.isDMBased() && (msg.cleanContent?.toLowerCase() == "test")) {
    msg.reply((Math.random() < 0.8 ? "pass" : "fail"));
  }
  const exclude = [u.sf.channels.minecraftcategory];
  const roll = Math.random();
  if (roll < 0.3 && !msg.author?.bot && !exclude.includes(msg.channel.id)) {
    // let banana = /[bß8ƥɓϐβбБВЬЪвᴮᴯḃḅḇÞ][a@∆æàáâãäåāăȁȃȧɑαдӑӓᴀᴬᵃᵅᶏᶐḁạảấầẩẫậắằẳẵặ4Λ]+([nⁿńňŋƞǹñϰпНhийӣӥѝνṅṇṉṋ]+[a@∆æàáâãäåāăȁȃȧɑαдӑӓᴀᴬᵃᵅᶏᶐḁạảấầẩẫậắằẳẵặ4Λ]+){2}/ig;
    if (msg.content?.toLowerCase().includes("bananas")) {
      if (roll < 0.1) {
        msg.reply({ files: ['media/buttermelonsMan.jpeg'] }).catch(u.noop);
      } else {
        msg.reply("*buttermelons").catch(u.noop);
      }
    } else if (msg.content?.toLowerCase().includes("banana")) {
      if (roll < 0.06) {
        msg.reply({ files: ['media/buttermelonPile.png'] }).catch(u.noop);
      } else if (roll < 0.1) {
        msg.reply({ files: ['media/buttermelonMan.jpeg'] }).catch(u.noop);
      } else {
        msg.reply("*buttermelon").catch(u.noop);
      }
    }
  }
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunQuote(int) {
  const url = "https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en";
  await int.deferReply();
  // @ts-ignore
  const response = await axios({ url, method: "get" }).catch((/** @type {axios.AxiosError} */ e) => {
    throw new Error(`axios error: ${e.status}\n${e.message}`);
  });
  const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  const embed = u.embed();
  if (data) {
    embed.setAuthor({ name: data.quoteAuthor })
      .setDescription(data.quoteText);
  } else {
    embed.setAuthor({ name: "ChainSword20000" })
      .setDescription("A developer uses dark mode because bugs are attracted to light, \n" +
      "> but wouldn't that put the bugs in the code instead of the background?\n");
  }
  return int.editReply({ embeds: [embed] });
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunNamegame(int) {
  const name = (int.options.getString("name") || int.user.displayName)
    .replace(/[^a-zA-Z]/g, '_')// just ABCabc etc, numbers were causing problems.
    .split("_")[0];// and just one segment
  try {
    const url = `https://thenamegame-generator.com/lyrics/${name}.html`;
    await int.deferReply();
    // @ts-ignore
    const response = await axios({ url, method: "get" }).catch(() => {
      return int.editReply(`Could not generate lyrics for ${name}.\nPerhaps you can get it yourself from https://thenamegame-generator.com.`);
    });
    const song = /<blockquote>\n(.*)<\/blockquote>/g.exec(response?.data)?.[1]?.replace(/<br ?\/>/g, "\n");
    const pf = new profanityFilter();
    const profane = pf.scan(song?.toLowerCase().replace("\n", " ")).length;
    if (!song) {
      return int.editReply("I uh... broke my voice box. Try a different name?");
    } else if (profane > 0) {
      return int.editReply("Let's try a different one...");
    }
    const embed = u.embed().setTitle(`🎶 **The Name Game! ${name}! 🎵`).setDescription(song);
    return int.editReply({ embeds:[embed] });
  } catch (error) { u.errorHandler(error, int); }
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunChoose(int) {
  const optionsArg = int.options.getString("options", true);
  if (optionsArg && optionsArg.includes("|")) {
    const options = optionsArg.split("|");
    const prefixes = ["I choose", "I pick", "I decided"];
    return int.reply(`${u.rand(prefixes)} **${u.rand(options).trim()}**`);
  } else {
    return int.reply({ content: 'you need to give me two or more choices! "a | b"', ephemeral: true });
  }
}
/** @param {String} emoji unsanitized/irregular emoji input */
/** @returns {String} unicode code point with appended u */
function unicodeify(emoji) {
  const ucode = 'u' + emojilib.find(emoji)?.emoji.codePointAt(0)?.toString(16);
  return emojiKitchenSpecialCodes[ucode] ?? ucode;
  // return ucode;
  // let unicode;
  // if (/^[0-9A-Fa-f]+$/.test(emoji)) {
  //   unicode = emoji;
  // } else if (emoji.includes(":")) {
  //   let emojiName = emoji.substring(emoji.indexOf(":") + 1);
  //   emojiName = emojiName.substring(0, emojiName.indexOf(":"));
  //   unicode = emojiUnicode[emojiName];
  // } else {
  //   unicode = emoji.codePointAt(0)?.toString(16);
  // }
  // if (!unicode.startsWith('u')) {unicode = 'u' + unicode;}
  // return unicode;
}

/** @param {Discord.ChatInputCommandInteraction} int */
async function slashFunEmoji(int) {
  const emojiURLPrefixes = [
    20240715, 20240610, 20240530, 20240214, 20240206,
    20231128, 20231113, 20230821, 20230818, 20230803,
    20230426, 20230421, 20230418, 20230405, 20230301,
    20230221, 20230216, 20230127, 20230126, 20230118,
    20221107, 20221101, 20220823, 20220815, 20220506,
    20220406, 20220203, 20220110, 20211115, 20210831,
    20210521, 20210218, 20201001
  ];
  try {
    const emoji1 = int.options.getString("emoji1", true).trim();
    const emoji2 = int.options.getString("emoji2", true).trim();
    const emoji1unicode = unicodeify(emoji1);
    const emoji2unicode = unicodeify(emoji2);
    for (const pindex in emojiURLPrefixes) {
      const prefix = emojiURLPrefixes[pindex];
      // console.log("prefix");
      const urls = [
        `https://www.gstatic.com/android/keyboard/emojikitchen/${prefix}/${emoji1unicode}/${emoji1unicode}_${emoji2unicode}.png`,
        `https://www.gstatic.com/android/keyboard/emojikitchen/${prefix}/${emoji1unicode}/${emoji2unicode}_${emoji1unicode}.png`,
        `https://www.gstatic.com/android/keyboard/emojikitchen/${prefix}/${emoji2unicode}/${emoji1unicode}_${emoji2unicode}.png`,
        `https://www.gstatic.com/android/keyboard/emojikitchen/${prefix}/${emoji2unicode}/${emoji2unicode}_${emoji1unicode}.png`];
      // console.log(urls);
      for (const uindex in urls) {
        const url = urls[uindex];
        console.log(url);
        // @ts-ignore
        const response = await axios({ url, method: "get" }).catch(u.noop);
        if (response?.status == 200) {
          return int.editReply({ files: [{ attachment:url, name:"combined.png" }] });
        }
      }
    }
    return int.reply(`I could not find an emojiKitchen combonation of ${emoji1} and ${emoji2}.`);
  } catch (error) { u.errorHandler(error);return int.editReply("error:" + error); }
}

const Module = new Augur.Module()
.addInteraction({
  name: "fun",
  id: u.sf.commands.slashFun,
  process: async (int) => {
    const subcommand = int.options.getSubcommand(true);
    switch (subcommand) {
      case "roll": return slashFunRoll(int);
      case "8ball": return slashFun8ball(int);
      case "repost": return slashFunRepost(int);
      case "mines": return slashFunMinesweeper(int);
      case "acronym": return slashFunAcronym(int);
      case "hbs": return slashFunHBS(int);
      case "color": return slashFunColor(int);
      case "buttermelon": return slashFunButtermelon(int);
      case "quote": return slashFunQuote(int);
      case "namegame": return slashFunNamegame(int);
      case "choose": return slashFunChoose(int);
      case "emoji": return slashFunEmoji(int);
      default: return u.errorHandler(new Error("Unhandled Subcommand"), int);
    }
  }
})
.addEvent("messageCreate", buttermelonEdit)
.addEvent("messageUpdate", (oldMsg, msg) => {
  if (oldMsg.partial || !(oldMsg.cleanContent.toLowerCase().includes("banana"))) {
    buttermelonEdit(msg);
  }
// })
// .addEvent(
//   "messageReactionAdd",
//   (reaction) => { // could have (reaction, user) as args but lint don't like unused var.
//     if ((reaction.message.channel.id == u.sf.channels.memes) && (reaction.emoji.name == "♻️")) { //memes channel id will have to be added if this is to be enabled, I don't know if it is still needed or even used by anyone.
//       reaction.remove();
//       reaction.message.react("⭐").catch(u.errorHandler);
//     }
});

module.exports = Module;