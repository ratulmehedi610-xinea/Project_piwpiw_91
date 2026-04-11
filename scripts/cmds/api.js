const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "apivideo",
    version: "10.0",
    author: "ChatGPT",
    role: 0,
    category: "media"
  },

  onStart: async function ({ event, message }) {
    try {
      const reply = event.messageReply;

      // ✅ accept ANY attachment type (video/file/image fallback)
      if (!reply || !reply.attachments || !reply.attachments[0]) {
        return message.reply("❌ ভিডিও/ফাইলে রিপ্লাই দাও");
      }

      const file = reply.attachments[0];

      if (!file.url) {
        return message.reply("❌ ফাইল পাওয়া যায়নি");
      }

      await message.reply("⏳ API তৈরি হচ্ছে...");

      const cache = path.join(process.cwd(), "cache");
      await fs.ensureDir(cache);

      const filePath = path.join(cache, Date.now() + ".mp4");

      // ✅ download ANY file (video or not)
      const res = await axios.get(file.url, {
        responseType: "arraybuffer"
      });

      await fs.writeFile(filePath, res.data);

      // upload to catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000
        }
      );

      await fs.remove(filePath);

      const link = (upload.data || "").trim();

      if (!link.startsWith("http")) {
        return message.reply("❌ Upload failed");
      }

      return message.reply(
        "✅ API VIDEO READY!\n\n🔗 " + link
      );

    } catch (err) {
      console.log(err);
      return message.reply(
        "❌ Error!\n\n" +
        "👉 কারণ:\n" +
        "• Internet slow\n" +
        "• hosting block\n" +
        "• file too big\n\n" +
        "🔄 আবার try করো"
      );
    }
  }
};
