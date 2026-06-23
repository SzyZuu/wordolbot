const { SlashCommandBuilder } = require('discord.js');
const { normalize } = require('../../helpers/normalize.js');
const { findUsers } = require('../../helpers/findUsers.js');
const userRepository = require('../../repositories/userRepository.js');

module.exports = {
	cooldown: 60,
	data: new SlashCommandBuilder().setName('initialize').setDescription('Populate database with initial data'),
	async execute(interaction) {
		const channel = interaction.channel;

		const messages = await channel.messages.fetch({ limit: 100 });
		const allWordleMessages = messages.filter(msg => msg.author.id === process.env.WORDLE_USER_ID);
		const allStatMessages = allWordleMessages.filter(msg => msg.content.includes('Your group'));

		console.log('First of stats: ' + allStatMessages.first().content);
		console.log('Amount stat messages: ' + allStatMessages.size);

		const ocr = require('../../helpers/tesseractOcr.js');
		const wordleNumber = await ocr.extractWordleNumber(allStatMessages.first().attachments.first().url);

		const totalDays = allStatMessages.size;
		const userHistory = new Map();
		const userStreaks = new Map();

		const members = await interaction.guild.members.fetch();
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

		const occurences = new Map();
		const avgs = new Map();

		let i = 0;
		allStatMessages.forEach((msg) => {
			const lines = msg.content.split('\n');

			const final = findUsers(memberIndex, lines);

			for (const f of final) {
				const playerOccurences = (occurences.get(f.id) || 0);
				const prevAvg = (avgs.get(f.id) || 0);

				avgs.set(f.id, ((prevAvg * playerOccurences) + f.usrGuesses) / (playerOccurences + 1));
				occurences.set(f.id, playerOccurences + 1);
				if (!userHistory.has(f.id)) {
					userHistory.set(f.id, new Array(totalDays).fill(0));
				}
				userHistory.get(f.id)[i] = 1;
			}

			i++;
		});

		for (const [id, count] of occurences) {
			let currentStreak = 0;
			let maxStreak = 0;

			const dayArray = userHistory.get(id);
			for (const day of dayArray) {
				if (day === 1) {
					currentStreak++;
					if (currentStreak > maxStreak) maxStreak = currentStreak;
				}
				else {currentStreak = 0;}
			}

			userStreaks.set(id, maxStreak);
			console.log('Occurence (id, count): ' + id + ' ' + count + ' streak: ' + maxStreak + ' avg: ' + avgs.get(id));
		}

		// prepare stuffs for sending to db
		const ids = occurences.keys().toArray();
		const names = ids.map(id => memberIndex.get(id).names[0]);
		const streaks = ids.map(id => userStreaks.get(id));
		const averages = ids.map(id => {
			const raw = (avgs.get(id) || 0);
			return Math.round(raw * 10) / 10;
		});

		await userRepository.initializeUsers(ids, names, streaks, averages, wordleNumber, interaction.guildId);
	},
};
