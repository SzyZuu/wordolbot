const { Events } = require('discord.js');
const { normalize } = require('../helpers/normalize.js');
const { findUsersGuesses, findUsers } = require('../helpers/findUsers.js');
const historyRepository = require('../repositories/historyRepository');
const userRepository = require('../repositories/userRepository');
const gameRepository = require('../repositories/gameRepository');

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		if (!message.author.id === process.env.WORDLE_USER_ID) return;

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

		const isSummary = message.content.includes('Your group is on');

		if (!isSummary) {
			const now = new Date();
			const minutes = now.getUTCMinutes();
			const hours = now.getUTCHours();
			const utcTime = `${hours}:${minutes}:00`;

			const foundUsers = findUsers(memberIndex, message.content);

			for (const user of foundUsers) {
				await userRepository.updateTimeBuffer(user.id, utcTime);
			}
		}
		else {
			const ocr = require('../helpers/tesseractOcr');
			const wordleNumber = await ocr.extractWordleNumber(message.attachments.first().url);

			const lines = message.content.split('\n');
			const final = findUsersGuesses(memberIndex, lines);
			const ids = [];
			const guesses = [];

			for (const f of final) {
				ids.push(f.id);
				guesses.push(f.usrGuesses);
			}

			await gameRepository.addGame(wordleNumber);
			await historyRepository.addGameHistory(ids, wordleNumber, guesses);
		}
	},
};