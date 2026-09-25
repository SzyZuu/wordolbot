const { SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const { createImage } = require('../../helpers/imageGenerator');

module.exports = {
    cooldown: 0,
    data: new SlashCommandBuilder().setName('stats').setDescription('View your wordle stats!'),
    async execute(interaction){
        const img = await createImage(interaction.user.displayAvatarURL({extension: 'jpg'}), interaction.member.displayName, interaction.user.id);
        const attachment = new AttachmentBuilder(img, { name: 'stat-banner.png' })
        interaction.reply({files: [attachment]})
    },
}
