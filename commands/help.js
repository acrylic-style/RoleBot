const Discord = require('discord.js')
const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('help', { args: ['[Command]'] })
  }

  async run(msg, lang, args, sendDeletable, prefix) {
    if (args[1] && args[1] !== 'admin') {
      const { commands } = require('bot-framework/commands')
      const command = commands[args[1]]
      if (!command) return msg.channel.send(lang.no_command)
      const callback = p => {
        const nounderbar = p.replace(/([A-Z].*?)(_(.*?))/g, '$1 ')
        return nounderbar.replace(/\b[A-Z]{2,}\b/g, str => str.toLowerCase())
      }
      const embed = new Discord.RichEmbed()
        .setTitle('About this command')
        .setDescription(
          (lang.commands[args[1]] || ' - Not available information - ')
          + `\n\nUsage: ${prefix}${args[1]} ${command.args !== [] ? command.args.join('\n') : ''}`
          + `\nAlias: ${command.alias !== [] ? command.alias.join('\n') : lang.no}`
          + `\nAllowed in: ${command.allowedIn.join(', ')}`
          + `\nRequired permissions for you: ${command.permission.bitfield ? command.permission.toArray(false).map(callback).join(', ') : 'None'}`
          + `\nIs special command: ${command.requiredOwner ? lang.yes : lang.no}`
          + `\nIs enabled: ${command.enabled ? lang.yes : lang.no}`)
        .setTimestamp()
        .setColor([0,255,0])
      return sendDeletable(embed)
    }
    const embed = new Discord.RichEmbed()
      .setTitle('List of commands')
      .setColor([0,255,0])
    /**
     * 
     * @param {String|Array<String>} cmd 
     */
    const addEntry = cmd => {
      if (cmd.constructor.name === 'Array') {
        cmd.forEach(c => embed.addField(c, lang['commands'][c]))
      } else embed.addField(cmd, lang['commands'][cmd])
    }
    if (args[1] === 'admin') addEntry(['help', 'reason', 'warn', 'kick', 'ban', 'mute', 'reply', 'setstatus', 'setnote'])
    else addEntry(['help', 'version', 'remindme', 'roles', 'members', 'get', 'getp'])
    embed.addField('Note!', `\`${prefix}help [Command]\` for more help!`)
    sendDeletable(embed)
  }
}
