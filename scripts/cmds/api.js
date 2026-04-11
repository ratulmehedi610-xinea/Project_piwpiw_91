const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "apivideo",
    version: "5.0",
    author: "ChatGPT",
    role: 0,
    shortDescription: "Upload video → API link",
    category: "media"
  },

  onStart: async function ({ event, message }) {
    try {
      const reply = event.messageReply;

      if (!reply || !reply.attachments || reply.attachments.length === 0)
        return message.reply("❌ ভিডিওতে রিপ্লাই দাও");

      const video = reply.attachments[0];

      if (video.type !== "video")
        return message.reply("❌ এটা ভিডিও না");

      await message.reply("⏳ আপলোড হচ্ছে...");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      // download
      const res = await axios({
        url: video.url,
        method: "GET",
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
        { headers: form.getHeaders() }
      );

      const link = upload.data.trim();

      await fs.unlink(filePath);

      if (!link.startsWith("https://"))
        return message.reply("❌ আপলোড ফেল");

      // save for info
      await fs.writeJson(
        path.join(cacheDir, "apivideo.json"),
        { url: link }
      );

      return message.reply(
        "✅ API VIDEO CREATED!\n\n🔗 " + link
      );

    } catch (e) {
      console.log(e);
      return message.reply("❌ Error হয়েছে");
    }
  }
};
