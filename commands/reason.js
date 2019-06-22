const cases = require('../data/cases.json')
const fs = require('fs').promises
const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('reason', { args: ['<処罰ID> <理由>'], permission: 8, allowedIn: ['TextChannel'] })
  }

  async run(msg, lang, args, sendDeletable) {
    if (!args[2]) return msg.channel.send('引数を指定してください。(<<該当するメッセージID> <理由>>)')
    if (!Object.keys(cases).includes(args[1])) return msg.channel.send('引数が正しくありません。')
    cases[args[1]].reason = args.slice(2).join(' ')
    await fs.writeFile('./data/cases.json', JSON.stringify(cases))
    sendDeletable(':white_check_mark: reasonを設定しました')
  }
}
