// @ts-check
const u = require("./regUtils");

const role = (action = "add") => new u.string()
  .setName(action == 'equip' ? "color-role" : "role")
  .setDescription(`The role to ${action}`)
  .setRequired(true)
  .setAutocomplete(true);

const add = new u.sub()
  .setName("add")
  .setDescription("Add an opt-in role")
  .addStringOption(role());

const remove = new u.sub()
  .setName("remove")
  .setDescription("Remove an opt-in role")
  .addStringOption(role("remove"));

const assign = new u.sub()
  .setName("assign")
  .setDescription("[MOD] Assign someone a role")
  .addUserOption(
    new u.user()
      .setName("user")
      .setDescription("The user to receive the role")
      .setRequired(true)
  )
  .addStringOption(role("assign"));

const inventory = new u.sub()
  .setName("inventory")
  .setDescription("View all your color roles");

const equip = new u.sub()
  .setName("equip")
  .setDescription("Equip a color role")
  .addStringOption(role("equip"));


module.exports = new u.cmd()
  .setName("role")
  .setDescription("Add and remove self-assignable roles")
  .addSubcommand(add)
  .addSubcommand(remove)
  .addSubcommand(assign)
  .addSubcommand(inventory)
  .addSubcommand(equip)
  .setDMPermission(false)
  .toJSON();