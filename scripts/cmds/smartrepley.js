const fs = require("fs-extra");
const path = __dirname + "/cache/smartreply.json";

// 🔥 Bold style
function makeBold(text) {
  const fonts = {
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",
    l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",
    v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",
    L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",
    V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙"
  };
  return text.split("").map(c => fonts[c] || c).join("");
}

module.exports = {
config: {
  name: "smartreply",
  version: "3.0",
  author: "Nazim Ultra Pro",
  role: 0,
  category: "fun",
  shortDescription: "Smart Auto Reply 🤖",
  guide: {
    en: `
/smartreply add keyword = reply
/smartreply remove keyword
/smartreply list
`
  }
},

onStart: async function ({ event, args, message }) {
  const myUID = "61586144220686";

  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  let data = fs.readJsonSync(path);

  const cmd = args[0];

  // 🔥 ADD
  if (cmd === "add") {
    if (event.senderID !== myUID)
      return message.reply("❌ Boss ছাড়া add allowed না 😎");

    const content = args.slice(1).join(" ");
    const index = content.indexOf("=");

    if (index === -1)
      return message.reply("📌 Use:\n/smartreply add keyword = reply");

    const key = content.slice(0, index).toLowerCase().trim();
    const reply = content.slice(index + 1).trim();

    if (!key || !reply)
      return message.reply("❌ ভুল format 😒");

    data[key] = makeBold(reply);
    fs.writeJsonSync(path, data, { spaces: 2 });

    return message.reply(`✅ Added ✨\n👉 ${key}`);
  }

  // 🔥 REMOVE (same style as add)
  if (cmd === "remove") {
    if (event.senderID !== myUID)
      return message.reply("❌ Boss ছাড়া remove allowed না 😎");

    const key = args.slice(1).join(" ").toLowerCase().trim();

    if (!data[key])
      return message.reply("❌ এই keyword নাই 😒");

    delete data[key];
    fs.writeJsonSync(path, data, { spaces: 2 });

    return message.reply(`🗑️ Removed ✨\n👉 ${key}`);
  }

  // 🔥 LIST
  if (cmd === "list") {
    const keys = Object.keys(data);

    if (!keys.length)
      return message.reply("📭 কিছু add করা নাই");

    return message.reply(
      "📜 𝐒𝐦𝐚𝐫𝐭 𝐑𝐞𝐩𝐥𝐲 𝐋𝐢𝐬𝐭 👇\n\n" +
      keys.map((k, i) => `${i+1}. ${k}`).join("\n")
    );
  }
},

onChat: async function ({ event, message, api }) {
  if (!event.body || event.senderID == api.getCurrentUserID()) return;

  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  const data = fs.readJsonSync(path);

  const input = event.body.toLowerCase();

  // 🔥 Boss protection
  if (input.includes("nazim") || input.includes("boss")) {
    if (event.senderID !== "61586144220686") {
      return message.reply("😡 Boss কে disturb করিস না!");
    }
  }

  // 🔥 Smart match (partial)
  for (const key in data) {
    if (input.includes(key)) {
      return message.reply(data[key]);
    }
  }

  // 🔥 Emoji reply (styled)
  const autoReplies = {
    "😂": "এতো হাসিস কেন? 🤣",
    "😡": "রাগ কমা bro 😌",
    "❤️": "ভালোবাসা ছড়াও 💖",
    "🔥": "আগুন লাগাইছস 🔥",
    "🥱": "ঘুমাইতে যা 😴",
    "🐸": "ব্যাঙ নাকি তুই? 🐸🤣"
  };

  for (const [emoji, msg] of Object.entries(autoReplies)) {
    if (input.includes(emoji)) {
      return message.reply(makeBold(msg));
    }
  }
}
};
