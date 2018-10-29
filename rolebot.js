var os = require("os");
const f =require('string-format');
const Discord = require('discord.js');
const client = new Discord.Client();
const s = require('./secret.json');
const path = require('path');
var c = require('./config.json');
const lang = require('./lang/' + c.lang + '.json');
var fs = require('fs');
var process = require('process');
var log = new require('log');
var logger = null;

client.on('ready', () => {
  logger = new log('info', fs.createWriteStream('latest.log', 'utf-8'));
  logger.info("Logged in as %s(%s)!", client.user.tag, client.token);
  console.log(`Logged in as ${client.user.tag}(Token:${client.token})!`);
  client.user.setActivity(c.prefix + "help");
  logger.info("Bot has Fully startup.");
  console.log("Bot has Fully startup.");
});

function addRole(msg, rolename, isCommand = true) {
      var role = null;
      var member = null;
      try {
        role = msg.guild.roles.find("name", rolename);
        member = msg.guild.members.get(msg.author.id);
        if (isCommand) {
          if (msg.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            let embed = new Discord.RichEmbed().setTitle(":wastebasket: ロールから削除").setColor([255,0,0]).setDescription("ロール[" + rolename + "] から削除しました。");
            msg.channel.send(embed);
          } else {
            member.addRole(role).catch(console.error);
            let embed = new Discord.RichEmbed().setTitle(":heavy_plus_sign: ロールへ追加").setColor([0,255,0]).setDescription("ロール[" + rolename + "] へ追加しました。");
            msg.channel.send(embed);
          }
        } else {
            member.addRole(role).catch(console.error);
            console.log(`added role: ${role.name}`);
        }
      } catch (e) {
        console.error("Caught exception: " + e);
        console.error(e.stack);
        logger.error("Caught exception! " + e);
        logger.error(e.stack);
      }
}

function removeRole(msg, rolename, isCommand = true) {
      var role = null;
      var member = null;
      try {
        role = msg.guild.roles.find("name", rolename);
        member = msg.guild.members.get(msg.author.id);
        if (isCommand) {
          if (msg.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            let embed = new Discord.RichEmbed().setTitle(":wastebasket: ロールから削除").setColor([255,0,0]).setDescription("ロール[" + rolename + "] から削除しました。");
            msg.channel.send(embed);
          } else {
            member.addRole(role).catch(console.error);
            let embed = new Discord.RichEmbed().setTitle(":heavy_plus_sign: ロールへ追加").setColor([0,255,0]).setDescription("ロール[" + rolename + "] へ追加しました。");
            msg.channel.send(embed);
          }
        } else {
            member.removeRole(role).catch(console.error);
            console.log(`removed role: ${role.name}`);
        }
      } catch (e) {
        msg.channel.send(":x: エラー: " + e);
        console.error("Caught exception: " + e);
        console.error(e.stack);
        logger.error("Caught exception! " + e);
        logger.error(e.stack);
      }
}

client.on('message', msg => {
 if (!msg.author.bot) {
  if (msg.content.startsWith(c.prefix)) {
    if (msg.content === c.prefix + "help") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(f(lang.userhelp, c.prefix, c.aprefix));
    } else if (msg.content === c.prefix + "members") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(f(lang.members, msg.guild.memberCount));
    } else if (msg.content === c.prefix + "pc") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "pc");
    } else if (msg.content === c.prefix + "ps4") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "ps4");
    } else if (msg.content === c.prefix + "switch") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "switch");
    } else if (msg.content === c.prefix + "kyoka" || msg.content === c.prefix + "許可") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "許可");
    } else if (msg.content === c.prefix + "stw" || msg.content === c.prefix + "世界を救え" || msg.content === c.prefix + "set-stw") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "世界を救う人たち");
    } else if (msg.content === c.prefix + "ios" || msg.content === c.prefix + "mobile" || msg.content === c.prefix + "スマホ") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "スマホ");
    } else if (msg.content.startsWith(c.prefix + "roles")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let embed = new Discord.RichEmbed()
        .setTitle(":fork_and_knife: 機種割り当て")
        .setColor([3,255,255])
        .setDescription(f(" PC: `{0}pc`\n PS4: `{0}ps4`\n Xbox: `{0}xbox`\n スマホ: `{0}スマホ`\n 世界を救え: `{0}stw`", c.prefix));
      msg.channel.send(embed);
    } else if (msg.content.startsWith(c.prefix + "load")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      var la1 = os.loadavg()[0];
      var la2 = la1 * 100;
      var loadavg = Math.round(la2) / 100;
      msg.channel.send(f(lang.loadavg, loadavg));
    } else if (msg.content.startsWith(c.prefix + "say ")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
        if (msg.author != "<@445996883761037323>") {
          var commandcut = msg.content.substr(c.prefix + "say ".length); //cut "!bot " off of the start of the command
          var message = ""; //create message variable
          var argumentarray = commandcut.split(" "); // split array by "," characters
          argumentarray.forEach(function(element) { // foreach argument given
              message += element + " "; // add argument and space to message
          }, this);
          msg.channel.send(message);
        }
    } else if (msg.content.startsWith(c.prefix + "sayd ")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
        if (msg.author != "<@445996883761037323>") {
          var commandcut = msg.content.substr("!sayd ".length); //cut "!bot " off of the start of the command
          var message = ""; //create message variable
          var argumentarray = commandcut.split(" "); // split array by "," characters
          argumentarray.forEach(function(element) { // foreach argument given
              message += element + " "; // add argument and space to message
          }, this);
          msg.delete(0).catch(function (error) { msg.channel.send(":no_good: Missing permission: 'manage message'"); console.error("Error: missing 'manage message' permission."); logger.alert("Error: missing 'manage message' permission."); });
          msg.channel.send(message);
        }
    }
  }
 }
 if (msg.author != "<@445996883761037323>") {
  if (msg.content.startsWith(c.aprefix)) {
    if (msg.content === c.aprefix + "help") {
      logger.info("%s issued admin command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      msg.channel.send(f(lang.adminhelp, c.aprefix, c.prefix));
    } else if (msg.content === c.aprefix + "reload") {
      delete require.cache[path.resolve('./config.json')];
      c = require('./config.json');
      msg.channel.send(":ok_hand:");
    } else if (msg.content === c.aprefix + "fetch") {
      async function fetch() {
        msg.delete(0);
        await msg.channel.fetchMessages();
        await msg.guild.fetchMembers();
      }
      fetch();
    } else if (msg.content.startsWith(c.aprefix + "shutdown")) {
      logger.info("┏━ Processing Admin command: %s By %s(%s)", msg.content, msg.author, msg.author.tag);
      console.log(f(lang.processing_cmd, msg.content, msg.author, msg.author.tag));
      if(msg.author == "<@254794124744458241>") {
      const args = msg.content.slice(c.aprefix + "shutdown".length).trim().split(/ +/g);
        if(args[0] == "-f") {
          logger.info("┗━ Attempting Force Shutdown by %s", msg.author.tag);
          console.log(f(lang.atmpfs, msg.author.tag));
          msg.channel.send(lang.bye);
          client.destroy();
        } else {
          logger.info("┗━ Successfully execution of command, shutting down: %s", msg.content);
          console.log(f(lang.success, msg.content));
          msg.channel.send(lang.bye);
          client.destroy();
        }
      } else {
        msg.reply(lang.noperm);
        logger.info("┗━ Failed execution because User do not match. %s", msg.content);
        console.log(f(lang.failednotmatch, msg.content));
      }
    } else if (msg.content === c.aprefix + "token") {
      if (msg.author.id == "254794124744458241") {
        msg.author.send(f(lang.mytoken, client.token, s.inviteme));
        msg.reply(lang.senttodm);
        logger.info("%s issued admin command: %s", msg.author.tag, msg.content);
        console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
        var embed = new Discord.RichEmbed();
        embed.description = "You'll need to add permission - 'Manage Messages' => 'Save Changes'";
        embed.setColor([255, 0, 0]);
        msg.delete(5000).catch(function (error) { msg.channel.send(":no_good: Missing permission: 'manage message'", embed); console.error("Error: missing 'manage message' permission."); logger.alert("Error: missing 'manage message' permission."); });
      } else {
        msg.reply(lang.youdonthavear);
        logger.info("%s issued failed admin command(%s): %s", msg.author.tag, msg.content, "Doesn't have permission");
        console.log(f(lang.issuedfailadmin, msg.author.tag, msg.content, "Doesn't have Admin Role"));
      }
    }
  }
 }
});

client.on("messageReactionAdd", (reaction, user) => {
  console.log(`Reaction added: ${reaction.emoji.name} (${reaction.emoji.id})  by ${reaction.message.author.id}`);
  if (reaction.message.id == c.messageId || reaction.message.id == c.messageId2) {
    if (reaction.emoji.id == "460107727235055626") {
      addRole(reaction.message, "pc", false);
    }
    if (reaction.emoji.id == "460108080642785281") {
      addRole(reaction.message, "switch", false);
    }
    if (reaction.emoji.id == "460107911595819038") {
      addRole(reaction.message, "ps4", false);
    }
    if (reaction.emoji.id == "460108080458498079") {
      addRole(reaction.message, "スマホ", false);
    }
    if (reaction.emoji.id == "460328322153447444") {
      addRole(reaction.message, "許可", false);
    }
    if (reaction.emoji.id == "aaaaaaaa") {
      addRole(reaction.message, "世界を救う人たち", false)
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  console.log(`Reaction removed: ${reaction.emoji.name} (${reaction.emoji.id}) by ${reaction.message.author.id}`);
  if (reaction.message.id == c.messageId || reaction.message.id == c.messageId2) {
    if (reaction.emoji.id == "460107727235055626") {
      removeRole(reaction.message, "pc", false);
    }
    if (reaction.emoji.id == "460108080642785281") {
      removeRole(reaction.message, "switch", false);
    }
    if (reaction.emoji.id == "460107911595819038") {
      removeRole(reaction.message, "ps4", false);
    }
    if (reaction.emoji.id == "460108080458498079") {
      removeRole(reaction.message, "スマホ", false);
    }
    if (reaction.emoji.id == "460328322153447444") {
      removeRole(reaction.message, "許可", false);
    }
    if (reaction.emoji.id == "aaaaaaaaaaaaaaaa") {
      removeRole(reaction.message, "世界を救う人たち", false)
    }
  }
});

client.login(s.token);
