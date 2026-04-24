const fs = require("fs-extra");

const path = process.cwd() + "/cache/smartreply.json";

// Load / Save
function loadData() {
  try {
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
    return fs.readJsonSync(path);
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeJsonSync(path, data, { spaces: 2 });
  } catch {}
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
config: {
  name: "smartreply",
  version: "BASIC",
  author: "Nazim (clean version)",
  role: 0,
  category: "fun",
},

onStart: async function ({ event, args, message }) {
  let data = loadData();
  const threadID = event.threadID;
  const cmd = args[0];

  // ADD
  if (cmd === "add") {
    const text = args.slice(1).join(" ");
    const i = text.indexOf("=");

    if (i === -1)
      return message.reply("Use:\n/smartreply add key = reply1 | reply2");

    const key = text.slice(0, i).trim().toLowerCase();
    const replies = text.slice(i + 1).split("|").map(r => r.trim());

    if (!data[threadID]) data[threadID] = {};
    data[threadID][key] = { replies, count: 0 };

    saveData(data);
    return message.reply(`✅ Added → ${key}`);
  }

  // REMOVE
  if (cmd === "remove") {
    const key = args.slice(1).join(" ").toLowerCase();

    if (!data[threadID] || !data[threadID][key])
      return message.reply("❌ নাই");

    delete data[threadID][key];
    saveData(data);

    return message.reply(`🗑️ Removed ${key}`);
  }

  // LIST
  if (cmd === "list") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty");

    return message.reply(
      "📜 List:\n\n" +
      keys.map(k => `• ${k}`).join("\n")
    );
  }

  // STATS
  if (cmd === "stats") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 Empty");

    return message.reply(
      "📊 Usage:\n\n" +
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
      const reply = random(group[key].replies);

      group[key].count++;
      saveData(data);

      return message.reply(reply);
    }
  }
}
};
