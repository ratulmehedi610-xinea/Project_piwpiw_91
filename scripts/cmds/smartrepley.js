const fs = require("fs-extra");

// 📁 Folder fix
const dir = process.cwd() + "/cache";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const path = process.cwd() + "/cache/smartreply.json";

// 🔒 Load / Save
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

// 🔥 Style
function makeBold(text) {
  const fonts = { a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
    k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
    u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
    K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
    U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙"
  };
  return text.split("").map(c => fonts[c] || c).join("");
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ⏱️ Cooldown system
const userCooldown = {};
const groupCooldown = {};

module.exports = {
config: {
  name: "smartreply",
  version: "FINAL 12.0",
  author: "Nazim Ultra Pro + GPT FIXED",
  role: 0,
  category: "fun",
},

onStart: async function ({ event, args, message }) {
  const myUID = "61586144220686";
  let data = loadData();
  const threadID = event.threadID;

  // settings init
  if (!data.settings) data.settings = {};
  if (!data.settings[threadID]) {
    data.settings[threadID] = {
      on: true,
      cooldown: 3,
      userCooldown: 5,
      ai: true,
      react: true
    };
  }

  const cmd = args[0];

  // 🔘 ON/OFF
  if (cmd === "on" || cmd === "off") {
    if (event.senderID !== myUID) return;
    data.settings[threadID].on = cmd === "on";
    saveData(data);
    return message.reply(`⚙️ ${cmd.toUpperCase()}`);
  }

  // ⏱️ Group Cooldown
  if (cmd === "cooldown") {
    if (event.senderID !== myUID) return;
    data.settings[threadID].cooldown = parseInt(args[1]) || 3;
    saveData(data);
    return message.reply(`⏱️ Group cooldown: ${args[1]}s`);
  }

  // 👤 User Cooldown
  if (cmd === "usercd") {
    if (event.senderID !== myUID) return;
    data.settings[threadID].userCooldown = parseInt(args[1]) || 5;
    saveData(data);
    return message.reply(`👤 User cooldown: ${args[1]}s`);
  }

  // 🤖 AI ON/OFF
  if (cmd === "ai") {
    if (event.senderID !== myUID) return;
    data.settings[threadID].ai = args[1] === "on";
    saveData(data);
    return message.reply(`🤖 AI ${args[1]}`);
  }

  // 😆 React ON/OFF
  if (cmd === "react") {
    if (event.senderID !== myUID) return;
    data.settings[threadID].react = args[1] === "on";
    saveData(data);
    return message.reply(`😆 React ${args[1]}`);
  }

  // 🔥 ADD
  if (cmd === "add") {
    if (event.senderID !== myUID) return;

    const text = args.slice(1).join(" ");
    const i = text.indexOf("=");

    if (i === -1)
      return message.reply("Use:\n/smartreply add key = reply1 | reply2");

    const key = text.slice(0, i).trim().toLowerCase();
    const replies = text.slice(i + 1).split("|").map(r => makeBold(r.trim()));

    if (!data[threadID]) data[threadID] = {};
    data[threadID][key] = { replies, count: 0 };

    saveData(data);
    return message.reply(`✅ Added → ${key}`);
  }

  // 🗑️ REMOVE
  if (cmd === "remove") {
    if (event.senderID !== myUID) return;

    const key = args.slice(1).join(" ").toLowerCase();
    if (!data[threadID] || !data[threadID][key])
      return message.reply("❌ নাই");

    delete data[threadID][key];
    saveData(data);

    return message.reply(`🗑️ Removed ${key}`);
  }

  // 📊 STATS
  if (cmd === "stats") {
    const group = data[threadID] || {};
    const keys = Object.keys(group);

    if (!keys.length) return message.reply("📭 empty");

    return message.reply(
      "📊 Usage\n\n" +
      keys.map(k => `${k} → ${group[k].count}`).join("\n")
    );
  }
},

onChat: async function ({ event, message, api }) {
  if (!event.body || event.senderID == api.getCurrentUserID()) return;

  let data = loadData();
  const threadID = event.threadID;
  const senderID = event.senderID;
  const input = event.body.toLowerCase();

  const setting = data.settings?.[threadID];
  if (!setting || !setting.on) return;

  const now = Date.now();

  // ⏱️ group cooldown
  if (groupCooldown[threadID] &&
      now - groupCooldown[threadID] < setting.cooldown * 1000) return;

  // 👤 user cooldown
  if (!userCooldown[senderID]) userCooldown[senderID] = {};
  if (userCooldown[senderID][threadID] &&
      now - userCooldown[senderID][threadID] < setting.userCooldown * 1000) return;

  const group = data[threadID] || {};

  // 😆 React
  if (setting.react) {
    if (input.includes("😂")) api.setMessageReaction("😂", event.messageID, () => {}, true);
    if (input.includes("😡")) api.setMessageReaction("😡", event.messageID, () => {}, true);
  }

  // 🔥 keyword
  for (const key in group) {
    if (input.includes(key)) {
      const reply = random(group[key].replies);

      group[key].count++;
      saveData(data);

      groupCooldown[threadID] = now;
      userCooldown[senderID][threadID] = now;

      return message.reply(reply);
    }
  }

  // 🤖 AI fallback
  if (setting.ai && input.length > 3) {
    const aiReply = [
      "হুম বুঝলাম 🤔",
      "ঠিক আছে 👍",
      "আরে বাহ 😏",
      "interesting 👀",
      "আবার বল 😐"
    ];

    groupCooldown[threadID] = now;
    userCooldown[senderID][threadID] = now;

    return message.reply(makeBold(random(aiReply)));
  }
}
};
