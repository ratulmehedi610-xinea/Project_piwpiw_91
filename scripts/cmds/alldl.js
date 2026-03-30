const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

function detectPlatform(url) {
  if (url.includes("facebook")) return "Facebook";
  if (url.includes("tiktok")) return "TikTok";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("instagram")) return "Instagram";
  return null;
}

module.exports = {
  config: {
    name: "autodl",
    version: "1.0",
    author: "MahMUD",
    category: "media"
  },

  onChat: async function ({ api, event }) {
    try {
      if (!event.body) return;

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = event.body.match(urlRegex);
      if (!match) return;

      const link = match[0];
      const platform = detectPlatform(link);
      if (!platform) return;

      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, `auto_${Date.now()}.mp4`);

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();
      const apiUrl = `${base}/api/download/video?link=${encodeURIComponent(link)}`;

      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      const stats = fs.statSync(filePath);
      if (stats.size < 100) {
        fs.unlinkSync(filePath);
        return;
      }

      api.setMessageReaction("🔥", event.messageID, () => {}, true);

      api.sendMessage({
        body:
`╔══════════════╗
   🤖 AUTO DOWNLOAD
╚══════════════╝

📡 Platform: ${platform}
📦 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB

⬇️ Auto Download Complete`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log("AutoDL Error:", err);
    }
  }
};
