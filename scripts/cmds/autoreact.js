module.exports = {
  config: {
    name: "autoreact",
    version: "4.4.0",
    author: "MOHAMMAD AKASH",
    role: 0,
    category: "system",
    shortDescription: "Auto react (emoji + text)",
    longDescription: "Stable auto reaction without silent API fail"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      const { messageID, body, senderID, threadID } = event;
      if (!messageID || !body) return;

      // ❌ নিজের / বটের মেসেজে রিয়েক্ট না
      if (senderID === api.getCurrentUserID()) return;

      // ❌ cooldown
      global.__autoReactCooldown ??= {};
      if (
        global.__autoReactCooldown[threadID] &&
        Date.now() - global.__autoReactCooldown[threadID] < 2500
      ) return;

      global.__autoReactCooldown[threadID] = Date.now();

      const text = body.toLowerCase();
      let react = null;

      // ==========================
      // Emoji Categories
      // ==========================
      const categories = [
        { e: ["😂","🤣","😆","😄","😁"], r: "😆" },
        { e: ["😭","😢","🥺","💔"], r: "😢" },
        { e: ["❤️","💖","💘","🥰","😍"], r: "❤️" },
        { e: ["😡","🤬"], r: "😡" },
        { e: ["😮","😱","😲"], r: "😮" },
        { e: ["😎","🔥","💯"], r: "😎" },
        { e: ["👍","👌","🙏"], r: "👍" },
        { e: ["🎉","🥳"], r: "🎉" }
      ];

      // ==========================
      // Text Triggers (UPDATED)
      // ==========================
      const texts = [
        // Normal
        { k: ["haha","lol","moja","xd"], r: "😆" },
        { k: ["sad","kharap","mon kharap","cry"], r: "😢" },
        { k: ["love","valobasi","miss"], r: "❤️" },
        { k: ["rag","angry","rage"], r: "😡" },
        { k: ["wow","omg"], r: "😮" },
        { k: ["ok","yes","okay","hmm"], r: "👍" },

        // Islamic
        { k: ["assalamu alaikum","আস্সালামু আলাইকুম"], r: "🤲" },
        { k: ["walaikum salam","ওয়ালাইকুম সালাম"], r: "🕌" },
        { k: ["alhamdulillah","আলহামদুলিল্লাহ"], r: "🤍" },
        { k: ["inshallah","ইনশাআল্লাহ"], r: "✨" },
        { k: ["mashallah","মাশাআল্লাহ"], r: "🌙" },
        { k: ["subhanallah","সুবহানাল্লাহ"], r: "🌸" },

        // Names / relation
        { k: ["hasan","হাসান"], r: "😎" },
        { k: ["tahia","তাহিয়া"], r: "😊" },
        { k: ["janu","জানু"], r: "🥰" },
        { k: ["mama","মামা"], r: "😂" },
        { k: ["bhai","ভাই"], r: "🤝" },

        // Bye type
        { k: ["bye","tata","allah hafez","আল্লাহ হাফেজ"], r: "👋" }
      ];

      // ==========================
      // Emoji check first
      // ==========================
      for (const c of categories) {
        if (c.e.some(x => text.includes(x))) {
          react = c.r;
          break;
        }
      }

      // ==========================
      // Text check
      // ==========================
      if (!react) {
        for (const t of texts) {
          if (t.k.some(x => text.includes(x))) {
            react = t.r;
            break;
          }
        }
      }

      // ==========================
      // RANDOM EMOJI (NEW)
      // ==========================
      if (!react) {
        const randomEmoji = [
          "😆","😂","😎","🔥","💖","🤍","✨","🥰","🤝","👀",
          "😜","😇","🖤","🌸","🌙","💯","😈","😻","🤗","🙃"
        ];
        react = randomEmoji[Math.floor(Math.random() * randomEmoji.length)];
      }

      // ⏱ delay
      await new Promise(r => setTimeout(r, 800));

      // ✅ react
      api.setMessageReaction(react, messageID);

    } catch (e) {}
  }
};
