const fs = require("fs-extra");
const path = __dirname + "/cache/unsendData.json";

module.exports = {
	config: {
		name: "ghost",
		version: "5.0.0",
		author: "Hasan X Fix",
		category: "system"
	},

	onLoad: () => {
		if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
	},

	onChat: async ({ event, api, usersData }) => {
		const { threadID, messageID, senderID, type, body, attachments } = event;

		let unsendData = {};
		if (fs.existsSync(path)) unsendData = fs.readJsonSync(path);

		// Save message
		if (type === "message" || type === "message_reply") {
			if (!unsendData[threadID]) {
				unsendData[threadID] = { status: true, messages: {} };
			}

			unsendData[threadID].messages[messageID] = {
				senderID,
				body: body || "📎 Attachment",
				attachments: attachments?.map(att => att.url) || []
			};

			fs.writeJsonSync(path, unsendData);
		}

		// Handle unsend
		if (type === "message_unsend") {
			if (!unsendData[threadID] || !unsendData[threadID].status) return;

			const info = unsendData[threadID].messages[event.messageID];
			if (!info) return;

			// ❗ Bot নিজের unsend ignore
			if (info.senderID == api.getCurrentUserID()) return;

			const userName = await usersData.getName(info.senderID);

			let msg = `
⚠️ UNSEND ALERT ⚠️

😈 ${userName} একটা মেসেজ ডিলিট করছে!

💬 Message:
${info.body}
`;

			if (info.attachments.length > 0) {
				return api.sendMessage({
					body: msg,
					attachment: await Promise.all(
						info.attachments.map(url => global.utils.getStreamFromURL(url))
					)
				}, threadID);
			}

			api.sendMessage(msg, threadID);
		}
	},

	onStart: async ({ api, event, args }) => {
		const { threadID } = event;

		let unsendData = {};
		if (fs.existsSync(path)) unsendData = fs.readJsonSync(path);

		if (!unsendData[threadID]) {
			unsendData[threadID] = { status: true, messages: {} };
		}

		// ❗ এখন সবাই off করতে পারবে
		if (args[0] === "off") {
			unsendData[threadID].status = false;
			fs.writeJsonSync(path, unsendData);
			return api.sendMessage("❌ Ghost OFF (by user)", threadID);
		}

		// ❗ শুধু admin ON করতে পারবে
		if (args[0] === "on") {
			const threadInfo = await api.getThreadInfo(threadID);
			const adminIDs = threadInfo.adminIDs.map(a => a.id);

			if (!adminIDs.includes(event.senderID)) {
				return api.sendMessage("⚠️ Only admin can turn ON", threadID);
			}

			unsendData[threadID].status = true;
			fs.writeJsonSync(path, unsendData);
			return api.sendMessage("✅ Ghost ON", threadID);
		}

		return api.sendMessage("📌 Use: /ghost on /ghost off", threadID);
	}
};
