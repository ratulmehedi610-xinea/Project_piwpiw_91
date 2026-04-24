module.exports = {
config: {
  name: "smartreply",
  version: "FINAL",
  author: "Nazim FIX",
  role: 0,
  category: "fun",
  prefix: true // ⚠️ IMPORTANT ( !smartreply )
},

onStart: async function ({ event, args, message }) {
  const adminID = "61586144220686"; // 👉 তোর UID
  let data = loadData();
  const threadID = event.threadID;

  const cmd = args[0];

  // ❗ help
  if (!cmd) {
    return message.reply(
      "⚙️ Usage:\n\n" +
      "!smartreply add কিরে = বলদ\n" +
      "!smartreply remove কিরে\n" +
      "!smartreply list\n" +
      "!smartreply stats"
    );
  }

  // 🔒 admin only
  if (["add", "remove"].includes(cmd) && event.senderID !== adminID) {
    return message.reply("❌ Only admin");
  }

  // 🔥 ADD
  if (cmd === "add") {
    const text = args.slice(1).join(" ");
    const i = text.indexOf("=");

    if (i === -1) {
      return message.reply("❌ Use:\n!smartreply add কিরে = বলদ");
    }

    const key = text.slice(0, i).trim().toLowerCase();
    const replies = text
      .slice(i + 1)
      .split("|")
      .map(r => r.trim())
      .filter(r => r);

    if (!data[threadID]) data[threadID] = {};
    data[threadID][key] = { replies, count: 0 };

    saveData(data);
    return message.reply(`✅ Added → ${key}`);
  }

  // 🗑️ REMOVE
  if (cmd === "remove") {
    const key = args.slice(1).join(" ").toLowerCase();

    if (!data[threadID] || !data[threadID][key]) {
      return message.reply("❌ নাই");
    }

    delete data[threadID][key];
    saveData(data);

    return message.reply(`🗑️ Removed ${key}`);
  }

  // 📜 LIST
  if (cmd === "list") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty");

    return message.reply(
      "📜 List:\n\n" +
      keys.map(k => `• ${k}`).join("\n")
    );
  }

  // 📊 STATS
  if (cmd === "stats") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty");

    return message.reply(
      "📊 Usage:\n\n" +
      keys.map(k => `${k} → ${group[k].count}`).join("\n")
    );
  }
}
};
