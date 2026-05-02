 path = require("path
modts{
  config: {
    name: "emoji_voice",
    version: "3.0.0",
    author: "AKASH FIXED",
    countDown: 5,
    role: 0,
    shortDescription: "Emoji voice (Fully Fixed)",
    category: "system"
  },

  onStart: async function () {},

  onChat: async function ({ event, message, threadsData }) {
    const { body, threadID } = event;
    if (!body) return;

    // 🔐 THREAD BASED SAVE
    let data = await threadsData.get(threadID) || {};
    if (data.emojiVoice === undefined) data.emojiVoice = true;

    // ✅ COMMAND
    if (body.toLowerCase() === "emoji_voice on") {
      data.emojiVoice = true;
      await threadsData.set(threadID, data);
      return message.reply("✅ Emoji Voice ON");
    }

    if (body.toLowerCase() === "emoji_voice off") {
      data.emojiVoice = false;
      await threadsData.set(threadID, data);
      return message.reply("❌ Emoji Voice OFF");
    }

    if (!data.emojiVoice) return;
    if (body.length > 3) return;

    const emojiAudioMap = {
      "🥱": ["https://files.catbox.moe/9pou40.mp3","https://files.catbox.moe/60cwcg.mp3"],
      "😁": ["https://files.catbox.moe/60cwcg.mp3"],
      "😌": ["https://files.catbox.moe/epqwbx.mp3"],
      "🥺": ["https://files.catbox.moe/wc17iq.mp3","https://files.catbox.moe/dv9why.mp3"],
      "🤭": ["https://files.catbox.moe/cu0mpy.mp3"],
      "😅": ["https://files.catbox.moe/jl3pzb.mp3"],
      "😏": ["https://files.catbox.moe/z9e52r.mp3"],
      "😞": ["https://files.catbox.moe/tdimtx.mp3"],
      "🤫": ["https://files.catbox.moe/0uii99.mp3"],
      "🤔": ["https://files.catbox.moe/hy6m6w.mp3"],
      "🥰": ["https://files.catbox.moe/dv9why.mp3"],
      "😘": ["https://files.catbox.moe/sbws0w.mp3","https://files.catbox.moe/37dqpx.mp3"],
      "😢": ["https://files.catbox.moe/shxwj1.mp3"],
      "😡": ["https://files.catbox.moe/h9ekli.mp3"],
      "🤬": ["https://files.catbox.moe/h9ekli.mp3"],
      "😍": ["https://files.catbox.moe/qjfk1b.mp3"],
      "😭": ["https://files.catbox.moe/itm4g0.mp3"],
      "🤣": ["https://files.catbox.moe/2sweut.mp3"],
      "🥵": ["https://files.catbox.moe/l90704.mp3"],
      "🙂": ["https://files.catbox.moe/4oks08.mp3"],
      "🙄": ["https://files.catbox.moe/vgzkeu.mp3"]
    };

    const emoji = body.trim();
    const audioList = emojiAudioMap[emoji];
    if (!audioList) return;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    for (let i = 0; i < 3; i++) {
      try {
        const audioUrl = audioList[Math.floor(Math.random() * audioList.length)];

        const filePath = path.join(
          cacheDir,
          `${Date.now()}_${Math.random()}.mp3`
        );

        const res = await axios({
          url: audioUrl,
          method: "GET",
          responseType: "stream",
          timeout: 15000
        });

        const writer = fs.createWriteStream(filePath);
        res.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await message.reply({
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);
        return;

      } catch (err) {
        if (i === 2) {
          console.log("Voice failed:", err.message);
        }
      }
    }
  }
};
