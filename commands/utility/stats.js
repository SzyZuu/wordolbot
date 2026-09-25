const { SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const { createImage } = require('../../helpers/imageGenerator');

module.exports = {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your wordle stats!')
        .addUserOption(option => option
            .setName("target")
            .setDescription("Target user to stalk :D")
            .setRequired(false)),
    async execute(interaction){
        const target = interaction.options.getUser("target") ?? interaction.user;
        const img = await createImage(target.displayAvatarURL({extension: 'jpg'}), target.displayName, target.id);
        const attachment = new AttachmentBuilder(img, { name: 'stat-banner.png' })
        interaction.reply({files: [attachment]})
    },
}
