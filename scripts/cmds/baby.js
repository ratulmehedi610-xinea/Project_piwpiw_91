const axios = require("axios");

// Simsimi API URL
const simsim = "http://176.100.37.91:30277";

module.exports = {
  config: {
    name: "baby",
    version: "1.0.5",
    author: "ULLASH (Fixed)",
    countDown: 0,
    role: 0,
    shortDescription: "Cute AI Baby Chatbot",
    longDescription: "Cute AI Baby Chatbot — Talk, Teach & Chat with Emotion ☢️",
    category: "simsim",
    guide: {
      en: "{pn} [message/query]"
    }
  },

  // ===================== ON START =====================
  onStart: async function ({ api, event, args, usersData }) {
    try {
      const uid = event.senderID;
      const senderName = await usersData.getName(uid);
      const rawQuery = args.join(" ").trim();
      const query = rawQuery.toLowerCase();

      // No query response
      if (!query) {
        const replies = ["Bolo baby 😘", "Hum bolo 😺"];
        const msg = replies[Math.floor(Math.random() * replies.length)];

        return api.sendMessage(msg, event.threadID, (err, info) => {
          if (!err && global.GoatBot?.onReply) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              author: event.senderID
            });
          }
        }, event.messageID);
      }

      const command = args[0].toLowerCase();

      // ===================== REMOVE =====================
      if (["remove", "rm"].includes(command)) {
        const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
        if (parts.length < 2) {
          return api.sendMessage(
            "❌ Use: remove [Question] - [Reply]",
            event.threadID,
            event.messageID
          );
        }

        const [ask, ans] = parts.map(p => p.trim());
        const res = await axios.get(
          `${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`,
          { timeout: 10000 }
        );

        return api.sendMessage(
          res.data?.message || "✅ Deleted Successfully!",
          event.threadID,
          event.messageID
        );
      }

      // ===================== LIST =====================
      if (command === "list") {
        const res = await axios.get(`${simsim}/list`, { timeout: 10000 });
        const data = res.data || {};

        if (data.code === 200) {
          return api.sendMessage(
            `📚 Total Questions: ${data.totalQuestions}
💬 Total Replies: ${data.totalReplies}
👨‍💻 Developer: ${data.author}`,
            event.threadID,
            event.messageID
          );
        }

        return api.sendMessage(
          "❌ Failed to fetch list.",
          event.threadID,
          event.messageID
        );
      }

      // ===================== EDIT =====================
      if (command === "edit") {
        const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
        if (parts.length < 3) {
          return api.sendMessage(
            "❌ Use: edit [Question] - [OldReply] - [NewReply]",
            event.threadID,
            event.messageID
          );
        }

        const [ask, oldReply, newReply] = parts.map(p => p.trim());
        const res = await axios.get(
          `${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`,
          { timeout: 10000 }
        );

        return api.sendMessage(
          res.data?.message || "✅ Edited Successfully!",
          event.threadID,
          event.messageID
        );
      }

      // ===================== TEACH =====================
      if (command === "teach") {
        const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
        if (parts.length < 2) {
          return api.sendMessage(
            "❌ Use: teach [Question] - [Reply]",
            event.threadID,
            event.messageID
          );
        }

        const [ask, ans] = parts.map(p => p.trim());
        const groupID = event.threadID;

        let groupName = event.threadName || "";
        if (!groupName && groupID !== uid) {
          try {
            const threadInfo = await api.getThreadInfo(groupID);
            groupName = threadInfo.threadName || "";
          } catch (e) {}
        }

        let url = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;

        if (groupName) {
          url += `&groupName=${encodeURIComponent(groupName)}`;
        }

        const res = await axios.get(url, { timeout: 10000 });

        return api.sendMessage(
          res.data?.message || "✅ Reply Added Successfully!",
          event.threadID,
          event.messageID
        );
      }

      // ===================== NORMAL CHAT =====================
      const res = await axios.get(
        `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`,
        { timeout: 10000 }
      );

      const responses = Array.isArray(res.data?.response)
        ? res.data.response
        : [res.data?.response || "🤖 Baby has no reply!"];

      for (const reply of responses) {
        await api.sendMessage(reply, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error("Baby Command Error:", err.message);
      return api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },

  // ===================== ON REPLY =====================
  onReply: async function ({ api, event, usersData }) {
    try {
      const text = event.body?.trim();
      if (!text) return;

      const senderName = await usersData.getName(event.senderID);

      const res = await axios.get(
        `${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`,
        { timeout: 10000 }
      );

      const responses = Array.isArray(res.data?.response)
        ? res.data.response
        : [res.data?.response || "🤖 Baby is silent!"];

      for (const reply of responses) {
        await api.sendMessage(reply, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("Reply Error:", err.message);
    }
  },

  // ===================== AUTO CHAT =====================
  onChat: async function ({ api, event, usersData }) {
    try {
      const raw = event.body?.toLowerCase().trim();
      if (!raw) return;

      const senderName = await usersData.getName(event.senderID);
      const senderID = event.senderID;

      const triggers = ["baby", "bot", "bby", "jan", "xan", "জান", "বট", "বেবি"];

      // Simple trigger
      if (triggers.includes(raw)) {
        const replies = [
          "হুম? বলো 😺",
          "হ্যাঁ জানু 😚",
          "শুনছি বেবি 😘",
          "Boss বল boss 😼",
          "এতো ডেকো না, প্রেমে পড়ে যাবো 🙈"
        ];

        const msg = replies[Math.floor(Math.random() * replies.length)];

        return api.sendMessage({
          body: `${msg} @${senderName}`,
          mentions: [{ tag: `@${senderName}`, id: senderID }]
        }, event.threadID, event.messageID);
      }

      // Trigger with message
      if (triggers.some(t => raw.startsWith(t + " "))) {
        const query = raw.split(" ").slice(1).join(" ");
        if (!query) return;

        const res = await axios.get(
          `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`,
          { timeout: 10000 }
        );

        const reply = res.data?.response || "🤖 No reply!";
        return api.sendMessage(reply, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error("OnChat Error:", err.message);
    }
  }
};
