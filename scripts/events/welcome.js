const { getTime } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.1",
		author: "NTKhang & Modified by Nazim",
		category: "events"
	},

	langs: {
		en: {
			session1: "Morning",
			session2: "Noon",
			session3: "Afternoon",
			session4: "Evening",
			welcomeMessage:
				"Thank you for inviting me to the group!\nBot Prefix: %1\nType %1help to see commands.",
			multiple1: "You",
			multiple2: "You all",
			defaultWelcomeMessage: `🌸 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 🌸

🎀 Welcome {multiple}
👤 Name: {userName}
📦 Group: {boxName}

👥 Member Count: {memberCount}
➕ Added By: {addedBy}
🕒 Time: {time}
📅 Date: {date}

✨ Have a nice {session}!
Enjoy your stay in the group! 💖`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType !== "log:subscribe") return;

		return async function () {
			try {
				const { threadID, logMessageData, author } = event;
				const hours = parseInt(getTime("HH"));
				const prefix = global.utils.getPrefix(threadID);
				const { nickNameBot } = global.GoatBot.config;

				const addedParticipants =
					logMessageData.addedParticipants || [];

				// If bot is added
				if (
					addedParticipants.some(
						user => user.userFbId == api.getCurrentUserID()
					)
				) {
					if (nickNameBot) {
						api.changeNickname(
							nickNameBot,
							threadID,
							api.getCurrentUserID()
						);
					}
					return message.send(
						getLang("welcomeMessage", prefix)
					);
				}

				// Initialize cache
				if (!global.temp.welcomeEvent[threadID]) {
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};
				}

				global.temp.welcomeEvent[
					threadID
				].dataAddedParticipants.push(...addedParticipants);

				clearTimeout(
					global.temp.welcomeEvent[threadID].joinTimeout
				);

				global.temp.welcomeEvent[
					threadID
				].joinTimeout = setTimeout(async () => {
					const threadData = await threadsData.get(threadID);
					if (
						threadData?.settings?.sendWelcomeMessage === false
					)
						return;

					const threadInfo = await api.getThreadInfo(
						threadID
					);
					const threadName =
						threadInfo.threadName || "Unknown Group";
					const memberCount =
						threadInfo.participantIDs.length;

					const participants =
						global.temp.welcomeEvent[threadID]
							.dataAddedParticipants;

					const userNames = [];
					const mentions = [];
					let multiple = false;

					if (participants.length > 1)
						multiple = true;

					for (const user of participants) {
						userNames.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (!userNames.length) return;

					// Get Adder Name
					let addedByName = "Unknown";
					try {
						const userInfo = await api.getUserInfo(author);
						addedByName = userInfo[author].name;
					} catch {}

					// Time & Date
					const time = getTime("HH:mm:ss");
					const date = getTime("DD/MM/YYYY");

					let {
						welcomeMessage = getLang(
							"defaultWelcomeMessage"
						)
					} = threadData.data || {};

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}/g, userNames.join(", "))
						.replace(
							/\{boxName\}|\{threadName\}/g,
							threadName
						)
						.replace(
							/\{memberCount\}/g,
							memberCount
						)
						.replace(/\{addedBy\}/g, addedByName)
						.replace(/\{time\}/g, time)
						.replace(/\{date\}/g, date)
						.replace(
							/\{multiple\}/g,
							multiple
								? getLang("multiple2")
								: getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
								? getLang("session2")
								: hours <= 18
								? getLang("session3")
								: getLang("session4")
						);

					const form = {
						body: welcomeMessage,
						mentions
					};

					// Random Anime Video API
					try {
						const cacheDir = path.join(
							__dirname,
							"cache"
						);
						await fs.ensureDir(cacheDir);

						const filePath = path.join(
							cacheDir,
							`anime_${Date.now()}.mp4`
						);

						const res = await axios.get(
							"https://api.waifu.pics/sfw/waifu"
						);

						const mediaUrl = res.data.url;

						const response = await axios({
							url: mediaUrl,
							method: "GET",
							responseType: "stream"
						});

						const writer =
							fs.createWriteStream(filePath);
						response.data.pipe(writer);

						await new Promise((resolve, reject) => {
							writer.on("finish", resolve);
							writer.on("error", reject);
						});

						form.attachment =
							fs.createReadStream(filePath);

						setTimeout(() => {
							if (fs.existsSync(filePath))
								fs.unlinkSync(filePath);
						}, 15000);
					} catch (error) {
						console.log(
							"Anime Attachment Error:",
							error.message
						);
					}

					await message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			} catch (error) {
				console.error("Welcome Event Error:", error);
			}
		};
	}
};
