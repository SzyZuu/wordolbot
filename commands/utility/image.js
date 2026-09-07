const { SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const { createImage } = require('../../helpers/imageGenerator');

module.exports = {
    cooldown: 0,
    data: new SlashCommandBuilder().setName('image').setDescription('debug'),
    async execute(interaction){
        const img = await createImage();
        const attachment = new AttachmentBuilder(img, { name: 'stat-banner.png' })
        interaction.reply({files: [attachment]})
    },
}