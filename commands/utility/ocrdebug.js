const { SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const { extractWordleNumber } = require('../../helpers/tesseractOcr');

module.exports = {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('ocrdebug')
        .setDescription('debug')
        .addAttachmentOption(option => option.setName("image").setRequired(true).setDescription("wtfihatethis")),
    async execute(interaction){
        const imgUrl = interaction.options.getAttachment("image").url;
        const nr = await extractWordleNumber(imgUrl);
        interaction.reply(nr);
    },
}