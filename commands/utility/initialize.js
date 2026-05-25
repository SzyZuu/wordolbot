const { SlashCommandBuilder } = require('discord.js');

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
		await ocr.extractWordleNumber(allStatMessages.first().attachments.first().url);

		const totalDays = allStatMessages.size;
		const userHistory = new Map();
		const userStreaks = new Map();

		const members = await interaction.guild.members.fetch();
		const memberIndex = members.map(m => ({
			id: m.id,
			names: [
				normalize(m.displayName),
				normalize(m.user.username),
				m.id,
			],
		}));

		const occurences = new Map();

		let i = 0;
		allStatMessages.forEach((msg) => {
			const matches = [];
			const msgContent = normalize(msg.content);

			for (const member of memberIndex) {
				for (const name of member.names) {
					if (!name) continue;

					if (msgContent.includes(name)) {
						matches.push({
							id: member.id,
							name,
							score: name.length,
						});
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

			for (const f of final) {
				occurences.set(f.id, (occurences.get(f.id) || 0) + 1);
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
			console.log('Occurence (id, count): ' + id + ' ' + count + ' streak: ' + maxStreak);
		}
	},
};

function normalize(str) {
	return str
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N} ]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}