const { Events } = require('discord.js');
const { normalize } = require('../helpers/normalize.js');
const { findUsersGuesses, findUsers } = require('../helpers/findUsers.js');
const { setCache, getCache } = require('../db');
const historyRepository = require('../repositories/historyRepository');
const userRepository = require('../repositories/userRepository');
const gameRepository = require('../repositories/gameRepository');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		console.log('Message created');
		if (message.author.id !== process.env.WORDLE_USER_ID) return;

		let members;
		try {
			const fetchedMembers = await message.guild.members.fetch();

			members = [...fetchedMembers.values()].map((member) => ({
				id: member.id,
				displayName: member.displayName,
				username: member.user.username,
			}));
			await setCache(message.guildId, members);
		}
		catch (err) {
			members = await getCache(message.guildId);
			if (!members) {
				console.log('Couldnt get any membrs', err);
				return;
			}
		}

		const memberIndex = new Map(
			members.map(m => [
				m.id,
				{
					names: [
						normalize(m.displayName),
						normalize(m.username),
						m.id,
					],
				},
			]));

		const isSummary = message.content.includes('Your group is on');

		if (!isSummary) {
			const now = new Date();
			const minutes = now.getUTCMinutes().toString().padStart(2, '0');
			const hours = now.getUTCHours().toString().padStart(2, '0');
			const utcTime = `${hours}:${minutes}:00`;

			const foundUsers = findUsers(memberIndex, message.content);

			const updatePromises = foundUsers.map(user =>
				userRepository.updateTimeBuffer(user.id, utcTime, message.guildId),
			);
			await Promise.all(updatePromises);
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

			const promises = ids.map(id => userRepository.updateUser(id, wordleNumber));
			await Promise.all(promises);
		}
	},
};