module.exports = {
  config: {
    name: "antiout",
    version: "4.0",
    author: "Hasan X",
    role: 0,
    shortDescription: "Anti Leave System",
    category: "boxchat",
    guide: "{pn} on/off"
  },

  onStart: async function ({ message, event, threadsData, args }) {
    if (!args[0]) 
      return message.reply("Use: antiout on / off");

    if (args[0] == "on") {
      await threadsData.set(event.threadID, true, "antiout");
      return message.reply("🐸 | Antiout turned ON");
    }

    if (args[0] == "off") {
      await threadsData.set(event.threadID, false, "antiout");
      return message.reply("🐸 | Antiout turned OFF");
    }
  },

  onEvent: async function ({ api, event, threadsData, usersData }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const status = await threadsData.get(event.threadID, "antiout");
    if (!status) return;

    const leftID = event.logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();

    // Ignore bot leave
    if (leftID == botID) return;

    try {
      await api.addUserToGroup(leftID, event.threadID);

      const name = await usersData.getName(leftID);

      const msgs = [
        "🚪 এই দরজা দিয়ে পালানো নিষেধ!",
        "🐸 পালাতে গেছিলি? আবার ধরে আনলাম!",
        "🔒 এই গ্রুপ জেলখানা, বের হওয়া যাবে না!",
        "😹 পালাইতে গিয়া ধরা খাইছিস!",
        "📢 Admin permission ছাড়া leave মানা!",
        "🏃‍♂️ পালানোর চেষ্টা ব্যর্থ!"
      ];

      const random = msgs[Math.floor(Math.random() * msgs.length)];

      api.sendMessage({
        body: `@${name} ${random}\n👉 হাসানের পারমিশন ছাড়া lift নেয়া যাবে না 🐸✌️`,
        mentions: [{
          tag: name,
          id: leftID
        }]
      }, event.threadID);

    } catch (e) {
      console.log("Antiout Error:", e);
    }
  }
};
