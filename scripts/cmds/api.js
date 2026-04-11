const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "apivideo",
    version: "1.2",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Create API video link"
    },
    longDescription: {
      en: "Upload replied video and get a Catbox direct link"
    },
    category: "media",
    guide: {
      en: "{pn} (reply to a video)"
    }
  },

  onStart: async function ({ event, message }) {
    try {
      const reply = event.messageReply;

      // Step 1: Check if user replied to a video
      if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return message.reply("❌ ভিডিওতে রিপ্লাই করুন।");
      }

      const attachment = reply.attachments[0];

      if (attachment.type !== "video") {
        return message.reply("❌ শুধুমাত্র ভিডিওতে রিপ্লাই করুন।");
      }

      await message.reply("⏳ ভিডিও প্রসেস হচ্ছে, অপেক্ষা করুন...");

      // Step 2: Create cache folder
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const tempPath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      // Step 3: Download video
      const videoData = await axios.get(attachment.url, {
        responseType: "arraybuffer"
      });

      await fs.writeFile(tempPath, videoData.data);

      // Step 4: Upload to Catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(tempPath));

      const upload = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        {
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      // Step 5: Delete temp file
      await fs.unlink(tempPath);

      const apiLink = upload.data.trim();

      if (!apiLink.startsWith("https://")) {
        throw new Error("Invalid response from Catbox");
      }

      // Step 6: Send result
      return message.reply(
        `✅ API ভিডিও তৈরি হয়েছে!\n\n🔗 ${apiLink}`
      );

    } catch (error) {
      console.error("APIVIDEO ERROR:", error);
      return message.reply(
        "❌ কাজ করছে না!\nসম্ভাব্য কারণ:\n" +
        "1️⃣ ভিডিও সাইজ বেশি\n" +
        "2️⃣ বট সার্ভার স্লো\n" +
        "3️⃣ Catbox সাময়িক বন্ধ\n\n" +
        "🔄 ছোট ভিডিও দিয়ে আবার চেষ্টা করুন।"
      );
    }
  }
};
