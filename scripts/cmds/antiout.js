module.exports = {
  config: {
    name: "antiout",
    version: "6.0",
    author: "Hasan X",
    role: 0,
    shortDescription: "Full Fix Anti Leave",
    category: "boxchat",
    guide: "{pn} on/off"
  },

  onStart: async function ({ message, event, threadsData, args }) {
    if (!args[0]) return message.reply("Use: antiout on/off");

    const status = args[0] === "on";
    await threadsData.set(event.threadID, status, "settings.antiout");

    return message.reply(`🐸 Antiout ${status ? "Enabled" : "Disabled"}`);
  },

  onEvent: async function ({ api, event, threadsData, usersData }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const status = await threadsData.get(event.threadID, "settings.antiout");
    if (!status) return;

    const leftID = event.logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();

    if (leftID == botID) return;

    setTimeout(async () => {
      try {
        await api.addUserToGroup(leftID, event.threadID);

        const name = await usersData.getName(leftID);

        api.sendMessage({
          body: `@${name} পালাইতে গেছিলি? আবার ধইরা আনলাম 😹\n👉 হাসানের পারমিশন ছাড়া lift নেয়া যাবে না 🐸✌️`,
          mentions: [{
            tag: name,
            id: leftID
          }]
        }, event.threadID);

      } catch (e) {
        // যদি add না হয় → invite link
        try {
          const threadInfo = await api.getThreadInfo(event.threadID);
          const inviteLink = threadInfo.inviteLink.enable 
            ? threadInfo.inviteLink.link 
            : "Invite link off";

          const name = await usersData.getName(leftID);

          api.sendMessage(
            `😹 @${name} পালাইতে পারবি না!\nএই লিংক দিয়া আবার ঢুক 👇\n${inviteLink}`,
            event.threadID
          );
        } catch (err) {
          console.log("Antiout Error:", err);
        }
      }
    }, 5000);
  }
};
