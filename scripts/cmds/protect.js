module.exports = {
  config: {
    name: "protect",
    version: "2.0",
    author: "MOHAMMAD AKASH + FIX",
    role: 1,
    shortDescription: "Lock group settings",
    category: "group",
    guide: "{pn} on/off"
  },

  onStart: async function ({ api, event, message, threadsData, args }) {
    const { threadID } = event;
    const option = args[0]?.toLowerCase();

    if (!option || !["on", "off"].includes(option)) {
      return message.reply("⚠️ | Use: protect on / protect off");
    }

    if (option === "on") {
      try {
        const info = await api.getThreadInfo(threadID);

        const protectData = {
          enable: true,
          name: info.threadName || "",
          emoji: info.emoji || "",
          color: info.color || "",
          nickname: {}
        };

        const members = info.userInfo || [];
        for (const user of members) {
          protectData.nickname[user.id] = user.nickname || "";
        }

        await threadsData.set(threadID, protectData, "data.protect");

        return message.reply(
          "🛡️ | Group Protect Enabled\n✅ Name, Nickname, Theme & Emoji Locked"
        );
      } catch (err) {
        console.log(err);
        return message.reply("❌ | Failed to enable protect.");
      }
    }

    if (option === "off") {
      await threadsData.set(threadID, {}, "data.protect");
      return message.reply("🔓 | Group Protect Disabled");
    }
  },

  onEvent: async function ({ api, event, threadsData }) {
    try {
      const { threadID, author, logMessageType, logMessageData } = event;

      if (!logMessageType) return;

      const protectData = await threadsData.get(threadID, "data.protect");
      if (!protectData || !protectData.enable) return;

      const info = await api.getThreadInfo(threadID);
      const adminIDs = info.adminIDs || [];
      const isAdmin = adminIDs.some(item => item.id == author);
      const isBot = api.getCurrentUserID() == author;

      // যদি non-admin change করে
      if (!isAdmin && !isBot) {
        if (logMessageType === "log:thread-name") {
          await api.setTitle(protectData.name || "", threadID);
        }

        if (logMessageType === "log:thread-icon") {
          await api.changeThreadEmoji(protectData.emoji || "👍", threadID);
        }

        if (logMessageType === "log:thread-color") {
          if (protectData.color) {
            await api.changeThreadColor(protectData.color, threadID);
          }
        }

        if (logMessageType === "log:user-nickname") {
          const uid = logMessageData?.participant_id;
          if (uid) {
            await api.changeNickname(
              protectData.nickname[uid] || "",
              threadID,
              uid
            );
          }
        }
      }

      // admin change করলে save update হবে
      if (isAdmin) {
        if (logMessageType === "log:thread-name") {
          await threadsData.set(
            threadID,
            logMessageData?.name || "",
            "data.protect.name"
          );
        }

        if (logMessageType === "log:thread-icon") {
          await threadsData.set(
            threadID,
            logMessageData?.thread_icon || "",
            "data.protect.emoji"
          );
        }

        if (logMessageType === "log:thread-color") {
          await threadsData.set(
            threadID,
            info.color || "",
            "data.protect.color"
          );
        }

        if (logMessageType === "log:user-nickname") {
          const uid = logMessageData?.participant_id;
          const nick = logMessageData?.nickname || "";
          if (uid) {
            await threadsData.set(
              threadID,
              nick,
              `data.protect.nickname.${uid}`
            );
          }
        }
      }
    } catch (err) {
      console.log("Protect Error:", err);
    }
  }
};
