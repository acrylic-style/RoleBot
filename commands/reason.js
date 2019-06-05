const cases = require('../data/cases.json')
const { Command } = require('bot-framework')
const { commands } = require('bot-framework/commands')

module.exports = class extends Command {
  constructor() {
    super('help', { args: ['[Command]'], permission: 8, allowedIn: ['TextChannel'] })
  }

  async run(msg, lang, args, sendDeletable) {
    if (!args[2]) return commands['help'].start({ ...msg, content: 'help' }, lang, ['help', 'reason'])
    if (!Object.keys(cases).includes(args[1])) return msg.channel.send('引数が正しくありません。')
    cases[args[1]].reason = args.slice(2).join(' ')
    sendDeletable(':white_check_mark: reasonを設定しました')
  }
}
