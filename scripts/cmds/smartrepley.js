const fs = require("fs-extra");
const path = __dirname + "/cache/smartreply.json";

module.exports.config = {
  name: "smartreply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT FIX",
  description: "Auto reply system",
  commandCategory: "group",
  usages: "[add/remove/list/on/off]",
  cooldowns: 3
};

// 🔹 file check
function loadData() {
  if (!fs.existsSync(path)) fs.writeJsonSync(path, { status: true, replies: {} });
  return fs.readJsonSync(path);
}

function saveData(data) {
  fs.writeJsonSync(path, data, { spaces: 2 });
}

// 🔥 COMMAND PART
module.exports.run = async function ({ api, event, args }) {
  const data = loadData();

  const cmd = args[0];

  // 🔘 ON
  if (cmd === "on") {
    data.status = true;
    saveData(data);
    return api.sendMessage("✅ SmartReply ON", event.threadID);
  }

  // 🔘 OFF
  if (cmd === "off") {
    data.status = false;
    saveData(data);
    return api.sendMessage("❌ SmartReply OFF", event.threadID);
  }

  // ➕ ADD
  if (cmd === "add") {
    const content = args.slice(1).join(" ");
    const match = content.match(/"(.*?)"\s*:\s*"(.*?)"/);

    if (!match) {
      return api.sendMessage(
        `⚠️ Use:\nsmartreply add "hi" : "hello"`,
        event.threadID
      );
    }

    const key = match[1].toLowerCase();
    const value = match[2];

    data.replies[key] = value;
    saveData(data);

    return api.sendMessage(`✅ Added: ${key}`, event.threadID);
  }

  // ➖ REMOVE
  if (cmd === "remove") {
    const key = args.slice(1).join(" ").toLowerCase();

    if (!data.replies[key]) {
      return api.sendMessage("❌ Not found!", event.threadID);
    }

    delete data.replies[key];
    saveData(data);

    return api.sendMessage(`🗑️ Removed: ${key}`, event.threadID);
  }

  // 📊 LIST
  if (cmd === "list") {
    const keys = Object.keys(data.replies);

    if (keys.length === 0) {
      return api.sendMessage("❌ No replies added!", event.threadID);
    }

    return api.sendMessage(
      "📊 Smart Replies:\n\n" + keys.join("\n"),
      event.threadID
    );
  }

  return api.sendMessage(
    `📌 Use:
smartreply on/off
smartreply add "hi" : "hello"
smartreply remove hi
smartreply list`,
    event.threadID
  );
};

// 🔥 AUTO REPLY PART
module.exports.handleEvent = async function ({ api, event }) {
  const data = loadData();

  if (!data.status) return;
  if (!event.body) return;

  const msg = event.body.toLowerCase();

  for (const key in data.replies) {
    if (msg.includes(key)) {
      return api.sendMessage(data.replies[key], event.threadID);
    }
  }
};
