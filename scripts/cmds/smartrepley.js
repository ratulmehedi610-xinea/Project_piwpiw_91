const fs = require("fs-extra");
const path = __dirname + "/cache/smartreply.json";

// Stylish bold text
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
  version: "1.0.0",
  author: "Nazim X ChatGPT",
  countDown: 0,
  role: 0,
  shortDescription: "Auto Reply System 🤖",
  category: "fun",
  guide: {
    en: "/smartreply add keyword = reply"
  }
},

// 🔥 COMMAND
onStart: async function ({ event, args, message }) {
  const myUID = "61586144220686";

  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  let data = fs.readJsonSync(path);

  // ADD SYSTEM
  if (args[0] === "add") {
    if (event.senderID !== myUID)
      return message.reply("❌ শুধু আমার boss add করতে পারবে 😎");

    const content = args.slice(1).join(" ");
    const parts = content.split("=");

    if (parts.length < 2) {
      return message.reply("📌 Use:\n/smartreply add keyword = reply");
    }

    const key = parts[0].toLowerCase().trim();
    const reply = parts.slice(1).join("=").trim();

    data[key] = makeBold(reply);
    fs.writeJsonSync(path, data, { spaces: 2 });

    return message.reply(`✅ Added:\n👉 ${key} → ${reply}`);
  }
},

// 🔥 AUTO REPLY
onChat: async function ({ event, message, api }) {
  if (!event.body || event.senderID == api.getCurrentUserID()) return;

  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  const data = fs.readJsonSync(path);

  const input = event.body.toLowerCase().trim();

  // Boss protection 😈
  if (input.includes("nazim") || input.includes("boss")) {
    if (event.senderID !== "61586144220686") {
      return message.reply("😡 Boss কে disturb করিস না!");
    }
  }

  // Custom replies
  if (data[input]) {
    return message.reply(data[input]);
  }

  // Emoji auto reply
  const autoReplies = {
    "😂": "এতো হাসিস কেন? 🤣",
    "😡": "রাগ কমা bro 😌",
    "❤️": "ভালোবাসা ছড়াও 💖",
    "🔥": "আগুন লাগাইছস 🔥",
    "🥱": "ঘুমাইতে যা 😴",
    "🐸": "ব্যাঙ নাকি তুই? 🐸🤣"
  };

  if (autoReplies[input]) {
    return message.reply(makeBold(autoReplies[input]));
  }

  // Emoji inside text detect
  for (const [emoji, msg] of Object.entries(autoReplies)) {
    if (event.body.includes(emoji)) {
      return message.reply(makeBold(msg));
    }
  }
}
};
