const u = require("./regUtils");

const team = new u.sub()
  .setName("team")
  .setDescription("Get info on this year's Extra Life team!");

const streaming = new u.sub()
  .setName("streaming")
  .setDescription("See who is currently streaming for Extra Life.");


const extralife = new u.subGroup()
  .setName("extralife")
  .setDescription("Get info on our charity streams.")
  .addSubcommand(team)
  .addSubcommand(streaming);

const live = new u.sub()
  .setName("live")
  .setDescription("See who's live in the server.");

module.exports = new u.cmd()
  .setName("twitch")
  .setDescription("Get info on our Twitch team!")
  .addSubcommandGroup(extralife)
  .addSubcommand(live)
  .setDMPermission(false);