const fs = require("fs-extra");

// 📁 file path
const path = process.cwd() + "/cache/smartreply.json";

// 📦 Load data
function loadData() {
  try {
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
    return fs.readJsonSync(path);
  } catch (e) {
    return {};
  }
}

// 💾 Save data
function saveData(data) {
  try {
    fs.writeJsonSync(path, data, { spaces: 2 });
  } catch (e) {}
}

module.exports = {
config: {
  name: "smartreply",
  version: "FIXED 1.0",
  author: "Nazim + GPT",
  role: 0,
  category: "fun",
  prefix: true
},

onStart: async function ({ event, args, message }) {
  const adminID = "61586144220686";

  let data = loadData();
  const threadID = event.threadID;
  const cmd = args[0];

  // help
  if (!cmd) {
    return message.reply(
      "⚙️ SMARTREPLY COMMANDS:\n\n" +
      "!smartreply add key = reply1 | reply2\n" +
      "!smartreply remove key\n" +
      "!smartreply list\n" +
      "!smartreply stats"
    );
  }

  // admin only for add/remove
  if (["add", "remove"].includes(cmd) && event.senderID !== adminID) {
    return message.reply("❌ Only admin can use this");
  }

  // 🔥 ADD
  if (cmd === "add") {
    const text = args.slice(1).join(" ");
    const i = text.indexOf("=");

    if (i === -1) {
      return message.reply("❌ Format wrong\nUse: !smartreply add hi = hello | hey");
    }

    const key = text.slice(0, i).trim().toLowerCase();
    const replies = text.slice(i + 1).split("|").map(r => r.trim()).filter(Boolean);

    if (!data[threadID]) data[threadID] = {};
    if (!data[threadID][key]) {
      data[threadID][key] = { replies: [], count: 0 };
    }

    data[threadID][key].replies.push(...replies);

    saveData(data);
    return message.reply(`✅ Added → ${key}`);
  }

  // 🗑️ REMOVE
  if (cmd === "remove") {
    const key = args.slice(1).join(" ").toLowerCase();

    if (!data[threadID] || !data[threadID][key]) {
      return message.reply("❌ Not found");
    }

    delete data[threadID][key];
    saveData(data);

    return message.reply(`🗑️ Removed → ${key}`);
  }

  // 📜 LIST
  if (cmd === "list") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty list");

    return message.reply(
      "📜 SMARTREPLY LIST:\n\n" +
      keys.map(k => `• ${k} (${group[k].replies.length})`).join("\n")
    );
  }

  // 📊 STATS
  if (cmd === "stats") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty stats");

    return message.reply(
      "📊 USAGE STATS:\n\n" +
      keys.map(k => `${k} → ${group[k].count}`).join("\n")
    );
  }
},

onChat: async function ({ event, message }) {
  if (!event.body) return;

  let data = loadData();
  const threadID = event.threadID;
  const input = event.body.toLowerCase();

  const group = data[threadID] || {};

  for (const key in group) {
    if (input.includes(key)) {
      const replies = group[key].replies;

      if (!replies || !replies.length) return;

      group[key].count++;
      saveData(data);

      return message.reply(
        replies[Math.floor(Math.random() * replies.length)]
      );
    }
  }
}
};
