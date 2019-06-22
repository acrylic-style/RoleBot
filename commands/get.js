const { RichEmbed } = require('discord.js')
const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('roles')
  }

  async run(msg, lang, args, sendDeletable) {
    const ids = require('./data/ads.json')
    if (!args[1]) return msg.channel.send('引数を指定してください。')
    if (!Number.isInteger(parseInt(args[1]))) return msg.channel.send('宣伝IDは数字でなければいけません。')
    if (!ids[parseInt(args[1])]) return msg.channel.send('指定された宣伝IDは存在しません。')
    const statuses = {
      'starred': 'スター(Starred)',
      'approved': '承認済み(Approved)',
      'pending': '保留中(Pending)',
      'unapproved': '承認解除(UnApproved)',
      'rejected': '拒否(Rejected)',
    }
    const embed = new RichEmbed()
      .setTitle('指定された宣伝IDの情報')
      .addField('状態', statuses[ ids[parseInt(args[1])].status ])
      .addField('メッセージ', ids[parseInt(args[1])].url)
      .addField('注記', ids[parseInt(args[1])].note)
    sendDeletable(embed)
  }
}
