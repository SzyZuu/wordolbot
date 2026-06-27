const { Events } = require('discord.js');
const { normalize } = require('../helpers/normalize');
const { findUsers } = require('../helpers/findUsers');
const userRepository = require('../repositories/userRepository');

module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		console.log('Message updated!');
		if (newMessage.content.includes(' were playing')) return;
		const words = new Set(oldMessage.content.split(' '));
		const words2 = newMessage.content.split(' ');
		if (!words2.some(word => !words.has(word))) return;

		const members = await newMessage.guild.members.fetch();
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

		const oldMessageUsers = findUsers(memberIndex, oldMessage.content);
		const oldIds = new Set(oldMessageUsers.map((u) => u.id));
		const newMessageUsers = findUsers(memberIndex, newMessage.content);

		const now = new Date();
		const minutes = now.getUTCMinutes().toString().padStart(2, '0');
		const hours = now.getUTCHours().toString().padStart(2, '0');
		const utcTime = `${hours}:${minutes}:00`;

		const newUsers = newMessageUsers.filter(user => !oldIds.has(user.id));

		const updatePromises = newUsers.map(user => userRepository.updateTimeBuffer(user.id, utcTime, newMessage.guildId));
		await Promise.all(updatePromises);
	},
};