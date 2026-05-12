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

		const members = await interaction.guild.members.fetch();
		for (const member of members) {
			console.log('Got member: ' + member[1].displayName);
		}

		const memberIndex = members.map(m => ({
			id: m.id,
			names: [
				normalize(m.displayName),
				normalize(m.user.username),
				m.id,
			],
		}));

		const occurences = new Map();

		for (const msg of allStatMessages) {
			const matches = [];
			const msgContent = normalize(msg[1].content);

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
			}
		}

		for (const [id, count] of occurences) {
			console.log('Occurence (id, count): ' + id + ' ' + count);
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