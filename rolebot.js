const f = require('string-format')
const Discord = require('discord.js')
const client = new Discord.Client()
const s = require('./config.json')
const path = require('path')
/**
 * @type {{ token: string, inviteme: string, prefix: string, aprefix: string, lang: string, messageId: string, messageId2: string, blacklistedGID: Array<string>, blacklistedDMUID: Array<string>, emojis: { tickYes: string, tickNo: string, pc: string, switch: string, mobile: string, ps4: string, xbox: string }, channels: { ad_application: string, ads: string, 'mod-log': string }, owners: Array<String> }}
 */
let c = require('./config.json')
const lang = require('./lang/' + c.lang + '.json')
const fs = require('fs')
const { LoggerFactory } = require('logger.js')
const logger = LoggerFactory.getLogger('client', 'purple')
const cases = JSON.parse(fs.readFileSync('./data/cases.json'))
const dispatcher = require('bot-framework/dispatcher')
const handlers = {}
const approves = {}
const ids = require('./data/ads.json')
const approvedguilds = Object.values(ids).filter(({ status }) => status === 'approved').map(e => e.guildid)
//const mutes = require('./data/mutes.json') // { serverID: { userID: { user: userID(for Object.values), expires: number, ... } } }

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

client.on('ready', () => {
  logger.info('Logged in as ' + client.user.tag)
  client.user.setActivity(`[DMで宣伝許可申請] | ${c.prefix}help`)
  logger.info('Bot has Fully startup.')
})

function addRole(msg, rolename, isCommand = true) {
  let role
  let member
  try { // eslint-disable-line
    role = msg.guild.roles.find(r => r.name === rolename) || msg.guild.roles.get(rolename.startsWith('id:') ? rolename.replace('id:', '') : null)
    member = msg.guild.members.get(msg.author.id)
    if (isCommand) {
      if (msg.member.roles.has(role.id || rolename.replace('id:', ''))) {
        member.removeRole(role).catch(e => logger.error(e))
        const embed = new Discord.RichEmbed().setTitle(':wastebasket: ロールから削除').setColor([255,0,0]).setDescription('ロール[' + role.name + '] から削除しました。')
        msg.channel.send(embed)
      } else {
        member.addRole(role).catch(e => logger.error(e))
        const embed = new Discord.RichEmbed().setTitle(':heavy_plus_sign: ロールへ追加').setColor([0,255,0]).setDescription('ロール[' + role.name + '] へ追加しました。')
        msg.channel.send(embed)
      }
    } else {
      member.addRole(role).catch(e => logger.error(e))
      logger.debug(`added role: ${role.name}`)
    }
  } catch (e) {
    logger.error('Caught exception! ' + e)
    logger.error(e.stack)
  }
}
function removeRole(msg, rolename, isCommand = true) {
  let role = null
  let member = null
  try { // eslint-disable-line
    role = msg.guild.roles.find('name', rolename)
    member = msg.guild.members.get(msg.author.id)
    if (isCommand) {
      if (msg.member.roles.has(role.id)) {
        member.removeRole(role).catch(e => logger.error(e))
        const embed = new Discord.RichEmbed().setTitle(':wastebasket: ロールから削除').setColor([255,0,0]).setDescription('ロール[' + rolename + '] から削除しました。')
        msg.channel.send(embed)
      } else {
        member.addRole(role).catch(e => logger.error(e))
        const embed = new Discord.RichEmbed().setTitle(':heavy_plus_sign: ロールへ追加').setColor([0,255,0]).setDescription('ロール[' + rolename + '] へ追加しました。')
        msg.channel.send(embed)
      }
    } else {
      member.removeRole(role).catch(e => logger.error(e))
      logger.info(`removed role: ${role.name}`)
    }
  } catch (e) {
    msg.channel.send(':x: エラー: ' + e)
    logger.error('Caught error: ' + e.stack || e)
  }
}

client.on('message', async msg => {
  const invite = /discord\.gg\/(.{1,})/gm.exec(msg.content)
  if (invite && msg.guild && !msg.system && !msg.author.bot) {
    logger.info('Caught invite URL!')
    if (invite[1]) {
      const finvite = await client.fetchInvite(invite[0])
      if (finvite.guild.id === msg.guild.id) return
      if (c.blacklistedGID.includes(finvite.guild.id)) {
        logger.info('attempting to delete blacklisted invite url')
        msg.delete()
        return msg.reply('投稿された招待URLのサーバーはブラックリストに登録されています。').then(_ => _.delete(10000))
      } else if (!approvedguilds.includes(finvite.guild.id)) {
        logger.info('attempting to delete not approved invite url')
        msg.delete()
        return msg.reply('投稿された招待URLはまだ承認されていないようです。\nDMを送って承認されてからもう一度お試しください。').then(_ => _.delete(10000))
      }
    }
  }
  if (msg.author.bot) return
  const supportedCommands = ['version', 'eval', 'help', 'reason']
  if (msg.content.startsWith(c.prefix) && supportedCommands.filter(e => msg.content.includes(e))) return dispatcher(msg, lang, c.prefix, c.owners, c.prefix)
  if (msg.channel.constructor.name === 'DMChannel' || msg.channel.constructor.name === 'GroupDMChannel') {
    if (c.blacklistedDMUID.includes(msg.author.id)) return true
    const least = 2 // do not set to zero
    const id = getRandomInt(100, 100000) // 100 to 100000
    let msgurl
    if (!msg.content.includes('--dry-run')) msgurl = await client.channels.get(c.channels['ad_application']).send(`${msg.author.tag} (${msg.author.id})から[宣伝ID:`+id+']:\n' + '```\n' + msg.content.replace(/```/gm, '---') + '\n```\n宣伝メッセージ:```\n' + msg.content.split('```')[1] + '\n```\n\n(' + msg.createdAt + 'に送信されました。)')
    msg.channel.send(':ok_hand: メッセージを送信しました(Message has been sent)。 [宣伝ID: '+id+']' + (msg.content.includes('--dry-run') ? '(--dry-runが指定済みなので送信されていません)' : '') + '\n最低' + least + '人のAdminに承認される必要があります。')
    if (msgurl) {
      await Promise.all([
        msgurl.react(msgurl.guild.emojis.get(c.emojis['tickYes'])),
        msgurl.react(msgurl.guild.emojis.get(c.emojis['tickNo'])),
      ]).catch(e => msgurl.channel.send('Something went wrong: ' + e.stack || e))
    }
    const url = `https://discordapp.com/channels/${msgurl.guild.id}/${msgurl.channel.id}/${msgurl.id}`
    ids[id] = { status: 'pending', 'url': url, 'note': '(none)', 'by': msg.author.name, 'avatarURL': msg.author.avatarURL, 'guildid': (await client.fetchInvite(msg.content)).guild.id }
    if (msg.content.includes('--dry-run')) ids[id].note = 'Generated with dry-run option. Do not approve.'
    handlers[msgurl.id] = async eid => {
      if (eid === c.emojis['tickYes']) {
        approves[msgurl.id] = (typeof approves[msgurl.id] !== 'undefined' ? approves[msgurl.id] + 1 : 1)
        if (approves[msgurl.id] >= least) {
          ids[id].status = 'approved'
          msg.client.channels.get(c.channels['ad_application']).send(msg.guild.emojis.get(c.emojis['tickYes']) + ' 宣伝ID: ' + id + 'は承認されました！')
          msg.client.channels.get(c.channels['ads']).send(msg.guild.emojis.get(c.emojis['tickYes']) + ' 宣伝ID: ' + id + 'は承認されました！')
          const webhook = await msg.client.channels.get(c.channels['ads']).createWebhook(msg.author.username, ids[id].avatarURL)
          await webhook.send(`宣伝ID:${id}(\`.get <宣伝ID>\` で状況を表示)\n` + (msg.content.split('```')[1] || msg.content.replace(/```/, '---')))
          webhook.delete()
          handlers[msgurl.id] = null
          delete handlers[msgurl.id]
        }
      } else if (eid === c.emojis['tickNo']) {
        ids[id].status = 'rejected'
        msg.client.channels.get(c.channels['ad_application']).send(msg.guild.emojis.get(c.emojis['tickNo']) + ' 宣伝ID: ' + id + 'は拒否されました。')
        msg.client.channels.get(c.channels['ads']).send(msg.guild.emojis.get(c.emojis['tickNo']) + ' 宣伝ID: ' + id + 'は拒否されました。')
        handlers[msgurl.id] = null
        delete handlers[msgurl.id]
      }
      
    }
  } //dispatcher(msg, lang, c.prefix, ['575673035743559701'])
  if (msg.content.startsWith(c.prefix)) {
    logger.info(`${msg.author.tag} sent command: ${msg.content}`)
    if (msg.content.startsWith(c.prefix + 'remindme ')) {
      const args = msg.content.replace(c.prefix, '').split(' ')
      setTimeout(() => { msg.reply(args.slice(2)) }, parseInt(args[1]) * 60 * 1000)
      msg.channel.send(':ok_hand:')
    } else if (msg.content === c.prefix + 'members') msg.channel.send(f(lang.members, msg.guild.memberCount))
    else if (msg.content === c.prefix + 'pc') addRole(msg, 'pc')
    else if (msg.content === c.prefix + 'ps4') addRole(msg, 'ps4')
    else if (msg.content === c.prefix + 'switch') addRole(msg, 'switch')
    else if (msg.content === c.prefix + 'kyoka' || msg.content === c.prefix + '許可') addRole(msg, '許可')
    else if (msg.content === c.prefix + 'stw' || msg.content === c.prefix + '世界を救え' || msg.content === c.prefix + 'set-stw') addRole(msg, '世界を救う者')
    else if (msg.content === c.prefix + 'ios' || msg.content === c.prefix + 'mobile' || msg.content === c.prefix + 'スマホ') addRole(msg, 'スマホ')
  } else if (msg.content.startsWith(c.prefix + 'getp ')) {
    const args = msg.content.replace(c.aprefix, '').split(' ')
    if (!args[1]) return msg.channel.send('引数を指定してください。(<処罰Case番号>)')
    console.log(Object.keys(cases))
    if (!Object.keys(cases).includes(args[1])) return msg.channel.send('引数が正しくありません。')
    const user = msg.client.users.get(cases[args[1]].user)
    const mod = msg.client.users.get(cases[args[1]].moderator)
    const embed = new Discord.RichEmbed()
      .setTitle(`${cases[args[1]].type} | Case #${args[1]}`)
      .addField('ユーザー', `${user.tag} (${user})`, true)
      .addField('モデレーター', mod.tag, true)
      .addField('理由', cases[args[1]].reason)
      .setDescription('メッセージ: ```'+cases[args[1]].message+'```')
      .setColor([255,0,0])
    msg.channel.send(embed)
  }
  if (msg.content.startsWith(c.aprefix) && msg.member.hasPermission(8)) {
    if (msg.content === c.aprefix + 'help') {
      logger.info('%s issued admin command: %s', msg.author.tag, msg.content)
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content))
      msg.channel.send(f(lang.adminhelp, c.aprefix, c.prefix))
    } else if (msg.content.startsWith(c.aprefix + 'warn') || msg.content.startsWith(c.aprefix + 'warning')) {
      const random = getRandomInt(100, 100000)
      const args = msg.content.replace(c.aprefix, '').split(' ')
      if (!args[1]) return msg.channel.send('引数を指定してください。(<<ユーザーID> [理由] [メッセージ]>)')
      if (!msg.client.users.has(args[1])) return msg.channel.send('指定されたユーザーが見つかりません。')
      const user = msg.client.users.get(args[1])
      const message = `
${msg.guild.name}サーバーのルール違反、もしくはDiscordガイドライン( https://discordapp.com/guidelines )違反、またはDiscord規約( https://discordapp.com/terms )違反が確認されました。

次回以降からは**キック**、もしくは**BAN**の対象となりますので、そのような行動は控えるようにしてください。

心当たりがない方は、Admin、もしくはOwnerまでお問い合わせください。
`
      cases[random] = {
        type: '警告',
        message: message,
        user: args[1],
        reason: args.slice(2).join(' ') || ('Admin: `,reason '+random+' [理由]` を実行してください'),
        moderator: msg.author.id,
      }
      msg.client.users.get(args[1]).send(cases[random].message+`\n\n理由: ${cases[random].reason}`)
      msg.guild.channels.find(channel => channel.name === 'mod-log').send(new Discord.RichEmbed()
        .setTitle(`${cases[random].type} | Case #${random}`)
        .addField('ユーザー', `${user.tag} (${user})`, true)
        .addField('モデレーター', msg.author.tag, true)
        .addField('理由', cases[random].reason)
        .setColor([255,255,0]))
    } else if (msg.content.startsWith(c.aprefix + 'ban')) {
      const random = getRandomInt(100, 100000)
      const args = msg.content.replace(c.aprefix, '').split(' ')
      if (!args[1]) return msg.channel.send('引数を指定してください。(<<ユーザーID> [理由] [メッセージ]>)')
      if (!msg.client.users.has(args[1])) return msg.channel.send('引数が正しくありません。')
      const user = msg.client.users.get(args[1])
      const message = `
${msg.guild.name}サーバーのルール違反、もしくはDiscordガイドライン( https://discordapp.com/guidelines )違反、またはDiscord規約( https://discordapp.com/terms )違反が確認されたので、サーバーから**BAN**されました。

心当たりがない方は、Admin、もしくはOwnerまでお問い合わせください(BAN実行者: ${msg.author})。
`
      cases[random] = {
        type: 'BAN',
        message: message,
        user: args[1],
        reason: args.slice(2).join(' ') || ('Admin: `,reason '+random+' [理由]` を実行してください'),
        moderator: msg.author.id,
      }
      msg.client.users.get(args[1]).send(cases[random].message+`\n\n理由: ${cases[random].reason}`)
      msg.guild.channels.find(channel => channel.name === 'mod-log').send(new Discord.RichEmbed()
        .setTitle(`${cases[random].type} | Case #${random}`)
        .addField('ユーザー', `${user.tag} (${user})`, true)
        .addField('モデレーター', msg.author.tag, true)
        .addField('理由', cases[random].reason)
        .setColor([255,0,0]))
      msg.guild.members.get(args[1]).ban(cases[random].reason)
    } else if (msg.content.startsWith(c.aprefix + 'reply')) {
      logger.info('%s issued command: %s', msg.author.tag, msg.content)
      console.log(f(lang.issueduser, msg.author.tag, msg.content))
      const args = msg.content.replace(c.aprefix, '').split(/\s{1,}/g)
      if (!args[2]) return msg.channel.send('引数を指定してください。(reply <<ユーザーID> <メッセージ>>)')
      msg.client.users.get(args[1]).send(`${msg.author}からのメッセージ: ${args.slice(2).join(' ')}`)
      msg.channel.send(':white_check_mark: 返信を送信しました。')
    } else if (msg.content.startsWith(c.aprefix + 'kick')) {
      const random = getRandomInt(100, 100000)
      const args = msg.content.replace(c.aprefix, '').split(' ')
      if (!args[1]) return msg.channel.send('引数を指定してください。(<<ユーザーID> [理由] [メッセージ]>)')
      if (!msg.client.users.has(args[1])) return msg.channel.send('引数が正しくありません。')
      const user = msg.client.users.get(args[1])
      const message = `
${msg.guild.name}サーバーのルール違反、もしくはDiscordガイドライン( https://discordapp.com/guidelines )違反、またはDiscord規約( https://discordapp.com/terms )違反が確認されたので、サーバーから**キック**されました。

心当たりがない方は、Admin、もしくはOwnerまでお問い合わせください(BAN実行者: ${msg.author})。
`
      cases[random] = {
        type: 'キック',
        message: message,
        user: args[1],
        reason: args.slice(2).join(' ') || ('Admin: `,reason '+random+' [理由]` を実行してください'),
        moderator: msg.author.id,
      }
      msg.client.users.get(args[1]).send(cases[random].message+`\n\n理由: ${cases[random].reason}`)
      msg.guild.channels.find(channel => channel.name === 'mod-log').send(new Discord.RichEmbed()
        .setTitle(`${cases[random].type} | Case #${random}`)
        .addField('ユーザー', `${user.tag} (${user})`, true)
        .addField('モデレーター', msg.author.tag, true)
        .addField('理由', cases[random].reason)
        .setColor([255,0,0]))
      msg.guild.members.get(args[1]).ban(cases[random].reason)
    } else if (msg.content.startsWith(c.aprefix + 'mute')) {
      msg.channel.send('Oh no!\nThis command isn\'t implemented yet...')
      /*const random = getRandomInt(100, 100000)
      const args = msg.content.replace(c.aprefix, "").split(" ")
      if (!args[1]) return msg.channel.send("引数を指定してください。(<<ユーザーID> [理由] [メッセージ]>)")
      if (!msg.client.users.has(args[1])) return msg.channel.send("引数が正しくありません。")
      const user = msg.client.users.get(args[1])
      const message = `
${msg.guild.name}サーバーのルール違反、もしくはDiscordガイドライン( https://discordapp.com/guidelines )違反、またはDiscord規約( https://discordapp.com/terms )違反が確認されたので、サーバーから**キック**されました。

心当たりがない方は、Admin、もしくはOwnerまでお問い合わせください(BAN実行者: ${msg.author})。
`;
      cases[random] = {
        type: "キック",
        message: message,
        user: args[1],
        reason: args.slice(2).join(' ') || ("Admin: `,reason "+random+" [理由]` を実行してください"),
        moderator: msg.author.id,
      };
      msg.client.users.get(args[1]).send(cases[random].message+`\n\n理由: ${cases[random].reason}`)
      const embed = new Discord.RichEmbed()
        .setTitle(`${cases[random].type} | Case #${random}`)
        .addField("ユーザー", `${user.tag} (${user})`, true)
        .addField("モデレーター", msg.author.tag, true)
        .addField("理由", cases[random].reason)
        .setColor([255,0,0])
      msg.guild.channels.find(channel => channel.name === 'mod-log').send(embed)
      msg.guild.members.get(args[1]).ban(cases[random].reason)*/
    } else if (msg.content.startsWith(c.aprefix + 'setstatus')) {
      const args = msg.content.replace(c.aprefix, '').split(' ')
      if (!args[2]) return msg.channel.send('引数を指定してください。(<<宣伝ID> <ステータス>>)')
      if (!Number.isInteger(parseInt(args[1]))) return msg.channel.send('宣伝IDは数字でなければいけません。')
      if (!ids[parseInt(args[1])]) return msg.channel.send('指定された宣伝IDは存在しません。')
      if (!['starred', 'approved', 'pending', 'unapproved', 'rejected'].includes(args[2])) return msg.channel.send('ステータスは`starred` `approved` `pending` `unapproved` `rejected`のいずれかである必要があります。')
      ids[parseInt(args[1])].status = args[2]
      if (args[2] === 'approved') ids[parseInt(args[1])].note = '手動で承認済み'
      if (args[2] === 'starred') ids[parseInt(args[1])].note = '手動でスター済み'
      const statuses = {
        'starred': 'スター(Starred)',
        'approved': '承認済み(Approved)',
        'pending': '保留中(Pending)',
        'unapproved': '承認解除(UnApproved)',
        'rejected': '拒否(Rejected)',
      }
      const embed = new Discord.RichEmbed()
        .setTitle('指定された宣伝IDの情報')
        .addField('状態', statuses[ ids[parseInt(args[1])].status ])
        .addField('メッセージ', ids[parseInt(args[1])].url)
        .addField('注記', ids[parseInt(args[1])].note)
      msg.channel.send(embed)
    } else if (msg.content.startsWith(c.aprefix + 'setnote')) {
      const args = msg.content.replace(c.aprefix, '').split(' ')
      if (!args[2]) return msg.channel.send('引数を指定してください。')
      if (!Number.isInteger(parseInt(args[1]))) return msg.channel.send('宣伝IDは数字でなければいけません。')
      if (!ids[parseInt(args[1])]) return msg.channel.send('指定された宣伝IDは存在しません。')
      ids[parseInt(args[1])].note = args[2]
      const statuses = {
        'starred': 'スター(Starred)',
        'approved': '承認済み(Approved)',
        'pending': '保留中(Pending)',
        'unapproved': '承認解除(UnApproved)',
        'rejected': '拒否(Rejected)',
      }
      const embed = new Discord.RichEmbed()
        .setTitle('指定された宣伝IDの情報')
        .addField('状態', statuses[ ids[parseInt(args[1])].status ])
        .addField('メッセージ', ids[parseInt(args[1])].url)
        .addField('注記', ids[parseInt(args[1])].note)
      msg.channel.send(embed)
    } else if (msg.content === c.aprefix + 'reload') {
      delete require.cache[path.resolve('./config.json')]
      delete require.cache['./config.json']
      c = require('./config.json')
      msg.channel.send(':ok_hand:')
    } else if (msg.content === c.aprefix + 'fetch') {
      msg.delete(0)
      await msg.channel.fetchMessages()
      await msg.guild.fetchMembers()
    }
  }
})

client.on('messageReactionAdd', (reaction, user) => {
  if (user.bot) return
  if (reaction.message.id == c.messageId || reaction.message.id == c.messageId2) {
    if (reaction.emoji.id === c.emojis['pc']) {
      addRole(reaction.message, 'pc', false)
    }
    if (reaction.emoji.id === c.emojis['switch']) {
      addRole(reaction.message, 'switch', false)
    }
    if (reaction.emoji.id === c.emojis['ps4']) {
      addRole(reaction.message, 'ps4', false)
    }
    if (reaction.emoji.id === c.emojis['mobile']) {
      addRole(reaction.message, 'スマホ', false)
    }
    if (reaction.emoji.id === '460328322153447444') {
      addRole(reaction.message, '許可', false)
    }
  }
  try { handlers[reaction.message.id](reaction.emoji.id) } catch(L) {} //eslint-disable-line
})

client.on('messageReactionRemove', (reaction, user) => {
  if (user.bot) return
  if (reaction.message.id == c.messageId || reaction.message.id == c.messageId2) {
    if (reaction.emoji.id === c.emojis['pc']) {
      removeRole(reaction.message, 'pc', false)
    }
    if (reaction.emoji.id === c.emojis['switch']) {
      removeRole(reaction.message, 'switch', false)
    }
    if (reaction.emoji.id === c.emojis['ps4']) {
      removeRole(reaction.message, 'ps4', false)
    }
    if (reaction.emoji.id === c.emojis['mobile']) {
      removeRole(reaction.message, 'スマホ', false)
    }
    if (reaction.emoji.id == '460328322153447444') {
      removeRole(reaction.message, '許可', false)
    }
  }
})

client.login(s.token)

fs.writeFileSync('./data/cases.json', JSON.stringify(cases))
fs.writeFileSync('./data/ads.json', JSON.stringify(ids))
//fs.writeFileSync('./data/approvedguilds.json', JSON.stringify(approvedguilds))

setInterval(() => {
  delete require.cache[require.resolve('./data/cases.json')]
  delete require.cache[require.resolve('./data/ads.json')]
  fs.writeFileSync('./data/cases.json', JSON.stringify(cases))
  fs.writeFileSync('./data/ads.json', JSON.stringify(ids))
  // fs.writeFileSync('./data/approvedguilds.json', JSON.stringify(approvedguilds))
}, 60 * 1000)
