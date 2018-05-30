var os = require("os");
const f =require('string-format');
const Discord = require('discord.js');
const client = new Discord.Client();
const s = require('./secret.json');
const c = require('./config.json');
const lang = require('./lang/' + c.lang + '.json');
var fs = require('fs');
var process = require('process');
var log = new require('log');
var logger = null;
var interval = null;

  /*fs.stat('lock', function(err, stat) {
    if(err == null) {
      // file exists, do something (or die)
      console.log("Lock file found, can't run the bot.");
      process.exit();
    }
  });*/
client.on('ready', () => {
  logger = new log('info', fs.createWriteStream('latest.log', 'utf-8'));
  logger.info("Logged in as %s(%s)!", client.user.tag, client.token);
  console.log(`Logged in as ${client.user.tag}(Token:${client.token})!`);
  fs.open('lock', 'w', function (err, file) {
    if (err) throw err;
    logger.info("Created lock file");
    console.log("Created lock file");
  });
  fs.writeFile('lock', process.pid, function(err) {
  if (err) throw err;
  logger.info("Saved lock file");
  console.log("Saved lock file");
  });
  client.user.setActivity("Help => " + c.prefix + "help");
  client.channels.get("450171632024289282").send(":ok_hand: 1 get :exclamation:");
  interval = client.setInterval(function() {
    logger.info("Executing Interval function");
    client.channels.get("449621199966830633").send(":white_check_mark: OK :ok_hand:");
  }, 3600000);
  logger.info("Interval Initialized.");
  console.log("Interval Initialized.");
  logger.info("ChatBot has Fully startup.");
  console.log("ChatBot has Fully startup.");
});

function addRole(msg, rolename) {
      var role = null;
      var member = null;
      try {
        role = msg.guild.roles.find("name", rolename);
        member = msg.guild.members.get(msg.author.id);
        if (msg.member.roles.has(role.id)) {
          member.removeRole(role).catch(console.error);
          let embed = new Discord.RichEmbed().setTitle(":wastebasket: ロールから削除").setColor([255,0,0]).setDescription("ロール[" + rolename + "] から削除しました。");
          msg.channel.send(embed);
        } else {
          member.addRole(role).catch(console.error);
          let embed = new Discord.RichEmbed().setTitle(":heavy_plus_sign: ロールへ追加").setColor([0,255,0]).setDescription("ロール[" + rolename + "] へ追加しました。");
          msg.channel.send(embed);
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
    } else if (msg.content.startsWith(c.prefix + "xbox")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "xbox");
    } else if (msg.content === c.prefix + "ios") {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      addRole(msg, "ios");
    } else if (msg.content.startsWith(c.prefix + "roles")) {
      logger.info("%s issued command: %s", msg.author.tag, msg.content);
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let embed = new Discord.RichEmbed()
        .setTitle(":fork_and_knife: 機種割り当て")
        .setColor([3,255,255])
        .setDescription(f(" PC: `{0}pc`\n PS4: `{0}ps4`\n Xbox: `{0}xbox`\n iOS(Mobile): `{0}ios`", c.prefix));
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
          var commandcut = msg.content.substr("!say ".length); //cut "!bot " off of the start of the command
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
    } else if (msg.content.startsWith(c.aprefix + "shutdown")) {
      logger.info("┏━ Processing Admin command: %s By %s(%s)", msg.content, msg.author, msg.author.tag);
      console.log(f(lang.processing_cmd, msg.content, msg.author, msg.author.tag));
      if(msg.author == "<@254794124744458241>") {
      const args = msg.content.slice(c.aprefix + "shutdown".length).trim().split(/ +/g);
        if(args[0] == "-f") {
          logger.info("┗━ Attempting Force Shutdown by %s", msg.author.tag);
          client.clearInterval(interval);
          console.log(f(lang.atmpfs, msg.author.tag));
          fs.unlink('lock', function (err) {
            if (err) throw err;
            console.log("Deleted lock file, Bye!");
            logger.info("Deleted lock file, Bye!");
          });
          msg.channel.send(lang.bye);
          client.destroy();
        } else {
          logger.info("┗━ Successfully execution of command, shutting down: %s", msg.content);
          client.clearInterval(interval);
          console.log(f(lang.success, msg.content));
          fs.unlink('lock', function (err) {
            if (err) throw err;
            logger.info("Deleted lock file, Bye!");
            console.log("Deleted lock file.");
          });
          msg.channel.send(lang.bye);
          client.destroy();
        }
      } else {
        msg.reply(lang.noperm);
        logger.info("┗━ Failed execution because User do not match. %s", msg.content);
        console.log(f(lang.failednotmatch, msg.content));
      }
    } else if(msg.content === c.aprefix + "token") {
      if(msg.member.roles.find("name", "TNT") || msg.member.roles.find("name", "Admin") || msg.author == "<@254794124744458241>") {
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
  /*} else if (msg.content.startsWith(c.aprefix + "ban")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(c.aprefix + "ban".length).trim().split(/ +/g);
      if(args[0] == ";ban") {
        msg.channel.send(":x: Arguments are missing.");
      } else {
        if(msg.guild.available) {
          msg.guild.ban(args[0], { reason: args[1] });
          client.channels.get("428163318415622154").send(":x: Banned " + args[0] + ".\nReason: " + args[1]);
          msg.channel.send(":x: Banned " + args[0] + ".\nReason: " + args[1]);
        }
      }*/
    }
  }
 }
});


client.login(s.token);

process.on('SIGINT', function() {
    client.clearInterval(interval);
    client.user.setAFK(true);
    fs.unlink('lock', function (err) {
    if (err) throw err;
    logger.info("Deleted lock file, Bye!");
    console.log("Deleted lock file.");
    });
    client.channels.get("449621199966830633").send(":skull: SIGINTで詰みました。おい、 <@254794124744458241> 、わざとやっただろ！");
    client.user.setActivity("Bot is down: Received SIGINT");
    logger.emergency("Caught interrupt signal, shutting down.");
    console.log("Caught interrupt signal, shutdown.");
    if (client.destroy()) {
        process.exit();
    }
});

process.on('uncaughtException', function(err) {
  client.clearInterval(interval);
  client.user.setAFK(true);
  client.user.setActivity("Bot is down due to errors.");
    fs.unlink('lock', function (err) {
    if (err) throw err;
    logger.info("Deleted lock file. See errors.");
    console.log("Deleted lock file.");
    });
  var e = {};
  Error.captureStackTrace(e);
  logger.alert("Caught exception: " + err);
  logger.alert(e.stack);
  console.log('Caught exception: ' + err);
  console.log(e.stack);
  client.channels.get("449621199966830633").send(":skull: エラーにより故障中。<@254794124744458241> によって仕組まれたバグだ！", {files: ["https://img.rht0910.tk/bug.png"]});
  client.destroy();
  process.exit();
});
