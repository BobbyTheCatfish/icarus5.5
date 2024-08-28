// @ts-check
const u = require('./regUtils');

const roll = new u.sub()
  .setName("roll")
  .setDescription("Roll Dice")
  .addIntegerOption(
    new u.int()
    .setName("dice")
    .setDescription("How many dice to roll? (will roll at least 1 anyway) (max of 10000)")
    .setRequired(false)
    .setMinValue(1)
    .setMaxValue(10000)
  )
  .addIntegerOption(
    new u.int()
    .setName("sides")
    .setDescription("How many sides on the dice to roll? (defaults to 6)")
    .setRequired(false)
    .setMinValue(1)
    .setMaxValue(2147483647)
  )
  .addIntegerOption(
    new u.int()
    .setName("modifier")
    .setDescription("How much to change the roll by? (defaults to 0)")
    .setRequired(false)
  );
const rollF = new u.sub()
  .setName("rollf")
  .setDescription("Roll Fate Dice")
  .addIntegerOption(
    new u.int()
    .setName("dice")
    .setDescription("How many dice to roll? (will roll at least 1 anyway) (max of 10000)")
    .setRequired(false)
    .setMinValue(1)
    .setMaxValue(10000)
  )
  .addIntegerOption(
    new u.int()
    .setName("modifier")
    .setDescription("How much to change the roll by? (defaults to 0)")
    .setRequired(false)
  );
const rollOld = new u.sub()
  .setName("rollold")
  .setDescription("Roll Dice using the old formula format")
  .addStringOption(
    new u.string()
    .setName("rollformula")
    .setDescription("old dice formula to use, it errors in the same way as !roll did")
  );
const ball8 = new u.sub()
  .setName("8ball")
  .setDescription("Get an answer from the Magic 8-ball.")
  .addStringOption(
    new u.string()
    .setName("question")
    .setDescription("What do you wish to ask the 8-ball today?")
    .setRequired(true)
  );
const allthe = new u.sub()
  .setName("allthe")
  .setDescription("ALL THE _____!")
  .addStringOption(
    new u.string()
    .setName("thing")
    .setDescription("something")
    .setRequired(true)
  );
const repost = new u.sub()
.setName("repost")
.setDescription("That's a repost.");
const acronym = new u.sub()
.setName("acronym")
.setDescription("Get a random 3-5 letter acronym. For science.");
const mines = new u.sub()
  .setName("mines")
  .setDescription("Play a game of Minesweeper!")
  .addStringOption(
    new u.string()
    .setName("difficulty")
    .setDescription("5 by 5 with 5 mines, 10 by 10 with 30 mines, or 14 by 14 with 60 mines")
    .setRequired(true)
    .setChoices(
      { name: "Easy", value: "Easy" },
      { name: "Medium", value: "Medium" },
      { name: "Hard", value: "Hard" })
  );
const hbs = new u.sub()
  .setName("hbs")
  .setDescription("Play a game of Handicorn, Buttermelon, Sloth!")
  .addStringOption(
    new u.string()
    .setName("choice")
    .setDescription("your choice of Handicorn, Buttermelon, or Sloth!")
    .setRequired(true)
    .setChoices(
      { name: "Handicorn", value: "Handicorn" },
      { name: "Buttermelon", value: "Buttermelon" },
      { name: "Sloth", value: "Sloth" })
  )
  .addStringOption(
    new u.string()
    .setName("vsmode")
    .setDescription("vs icarus, vs stored, or set stored")
    // .setRequired(false)
    .setChoices(
      { name: "vsicarus", value: "vsicarus" },
      { name: "vsstored", value: "vsstored" },
      { name: "setstored", value: "setstored" })
  );

const color = new u.sub()
  .setName("color")
  .setDescription("Show what a color looks like.")
  .addStringOption(
    new u.string()
    .setName("color")
    .setDescription("color (e.g. `#003B6F` or `blue`)")
  );
const hug = new u.sub()
  .setName("hug")
  .setDescription("Send a much needed hug.")
  .addUserOption(
    new u.user()
    .setName("hugee")
    .setDescription("Who do you want to hug?")
    .setRequired(true)
  );
const nameGame = new u.sub()
  .setName("namegame")
  .setDescription("Play the Name Game! (lyric generator)")
  .addStringOption(
    new u.string()
    .setName("name")
    .setDescription("(One word only, no special chars)")
  );
const buttermelon = new u.sub()
  .setName("buttermelon")
  .setDescription("Buttermelon facts");
module.exports = new u.cmd()
  .setName("fun")
  .setDescription("Its all fun and games till someone gets banned.")
  .addSubcommand(roll)
  .addSubcommand(rollF)
  .addSubcommand(rollOld)
  .addSubcommand(ball8)
  .addSubcommand(repost)
  .addSubcommand(mines)
  .addSubcommand(acronym)
  .addSubcommand(allthe)
  .addSubcommand(hbs)
  .addSubcommand(color)
  .addSubcommand(hug)
  .addSubcommand(buttermelon)
  .addSubcommand(nameGame)
  .toJSON();
