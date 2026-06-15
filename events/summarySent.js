const { Events } = require('discord.js');
const { normalize } = require('../helpers/normalize.js');
const { findUsers } = require('../helpers/findUsers.js');
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
			const final = findUsers(memberIndex, lines);
		}
	},
};