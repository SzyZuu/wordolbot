const { Events } = require('discord.js');
const { normalize } = require('../helpers/normalize.js');
const historyRepository = require('../repositories/historyRepository');

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		if (!message.author.id === process.env.WORDLE_USER_ID) return;

		const isSummary = message.content.includes('Your group is on');

		if (!isSummary) {
			// todo ig (get users, timestamp and update time buffer)
		}
		else {
			const ocr = require('../helpers/tesseractOcr');
			const wordleNumber = await ocr.extractWordleNumber(message.attachments.first().url);

			const guildId = message.guild_id;
			const guild = await message.client.guilds.fetch(guildId);
			const members = await guild.members.fetch();
			const memberIndex = new Map(
				members.map(m => [
					m.id,
					{
						names: [
							normalize(m.displayName),
							normalize(m.user.username),
							m.id,
						],
					},
				]));

			const lines = message.content.split('\n');
			const matches = [];
			for (const line of lines) {
				const match = line.match(/([1-6xX])\/6/i);
				if (match) {
					const score = match[1].toUpperCase();
					const guesses = score === 'X' ? 7 : parseInt(score, 10);
					const msgContent = normalize(line);

					for (const [usrID, member] of memberIndex) {
						for (const name of member.names) {
							if (!name) continue;

							if (msgContent.includes(name)) {
								matches.push({
									id: usrID,
									name,
									score: name.length,
									usrGuesses: guesses,
								});
							}
						}
					}
				}
			}

			matches.sort((a, b) => b.score - a.score);

			const final = [];
			const used = new Set();

			for (const m of matches) {
				if (!used.has(m.id)) {
					final.push(m);
					used.add(m.id);
				}
			}
		}
	},
};