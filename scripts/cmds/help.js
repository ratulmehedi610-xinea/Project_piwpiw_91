const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    version: "3.0",
    author: "Hasan X Dark",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Dark Help Menu",
    },
    longDescription: {
      en: "View all commands",
    },
    category: "info",
    guide: {
      en: "help or help cmdName",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // RANDOM VIDEO SYSTEM
    const videoFolder = __dirname + "/cache/helpvideo";
    let attachment = [];

    if (fs.existsSync(videoFolder)) {
      const files = fs.readdirSync(videoFolder).filter(file => file.endsWith(".mp4"));
      if (files.length > 0) {
        const randomFiles = files.sort(() => 0.5 - Math.random()).slice(0, 2);
        for (const file of randomFiles) {
          attachment.push(fs.createReadStream(path.join(videoFolder, file)));
        }
      }
    }

    // MAIN HELP MENU
    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔════════════════════╗
      🌑 𝐃𝐀𝐑𝐊 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 🌑
╚════════════════════╝`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || [];
        categories[category].push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `\n\n╭──『 ${category.toUpperCase()} 』`;

        const names = categories[category].sort();
        for (let i = 0; i < names.length; i += 2) {
          msg += `\n│ ✦ ${names[i]} ${names[i + 1] ? "│ ✦ " + names[i + 1] : ""}`;
        }

        msg += `\n╰──────────────`;
      });

      msg += `

╭──────────────
│ 🤖 Total Commands: ${commands.size}
│ ⚡ Prefix: ${prefix}
│ 📌 Type: ${prefix}help <command>
│ 👑 Admin: Mehedi Hasan
╰──────────────`;

      const sendMsg = await message.reply({
        body: msg,
        attachment
      });

      setTimeout(() => {
        message.unsend(sendMsg.messageID);
      }, 90000);
    }

    // COMMAND INFO
    else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply("❌ Command not found");
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";

      const longDescription = configCommand.longDescription
        ? configCommand.longDescription.en || "No description"
        : "No description";

      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{he}/g, prefix).replace(/{lp}/g, configCommand.name);

      const response = `╔══════════════════╗
      🌑 COMMAND INFO 🌑
╚══════════════════╝
│ 🎀 Name: ${configCommand.name}
│ 📃 Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
│ 📝 Description: ${longDescription}
│ 👑 Bot Admin: Mehedi Hasan
│ 🧑‍💻 Author: ${author}
│ 📚 Guide: ${usage}
│ ⭐ Version: ${configCommand.version || "1.0"}
│ ♻️ Role: ${roleText}
╰────────────────`;

      const helpMessage = await message.reply({
        body: response,
        attachment
      });

      setTimeout(() => {
        message.unsend(helpMessage.messageID);
      }, 90000);
    }
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0:
      return "All Users";
    case 1:
      return "Group Admin";
    case 2:
      return "Bot Admin";
    default:
      return "Unknown";
  }
		  }
