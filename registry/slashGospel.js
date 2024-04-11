// @ts-check
const u = require("./regUtils");

const verse = new u.sub()
  .setName("verse")
  .setDescription("Gets a scripture from any of the standard works or a random scripture mastery")
  .addStringOption(
    new u.string()
      .setName("book")
      .setDescription("The name of the book. `1 Nephi`, `Mosiah`, etc.")
      .setRequired(false)
  )
  .addStringOption(
    new u.string()
      .setName("chapter")
      .setDescription("The chapter in the book")
      .setRequired(false)
  )
  .addStringOption(
    new u.string()
      .setName("verses")
      .setDescription("Formats: `3`, `3-5`, `3-6,8,10-14`, etc. using commas, dashes, and numbers.")
      .setRequired(false)
  );

const comefollowme = new u.sub()
  .setName("comefollowme")
  .setDescription("Get the current Come Follow Me lesson");

const news = new u.sub()
  .setName("news")
  .setDescription("Gets LDS news")
  .addStringOption(
    new u.string()
      .setName("source")
      .setDescription("The news source")
      .setRequired(false)
      .setChoices(
        { name: "Newsroom", value: "newsroom" },
        { name: "Tabernacle Choir", value: "choir" }
      )
  );

module.exports = new u.cmd()
  .setName("gospel")
  .setDescription("Search gospel topics")
  .addSubcommand(verse)
  .addSubcommand(comefollowme)
  .addSubcommand(news)
  .toJSON();