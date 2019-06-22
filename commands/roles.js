const { RichEmbed } = require('discord.js')
const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('roles')
  }

  async run(msg, lang, args, sendDeletable, prefix) {
    const embed = new RichEmbed()
      .setTitle(':fork_and_knife: 機種割り当て')
      .setColor([0,255,255])
      .setDescription(`
 | PC: \`${prefix}pc\`
 | PS4: \`${prefix}ps4\`
 | Xbox: \`${prefix}xbox\`
 | スマホ: \`${prefix}スマホ\`
 | Switch: \`${prefix}switch\`
 | ---------------
 | PvE: \`${prefix}stw\`
`)
    sendDeletable(embed)
  }
}
