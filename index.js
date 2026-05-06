const { Client, Events, GatewayIntentBits, MessageFlags, Collection} = require('discord.js')
const path = require("path");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`)
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders){
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for(const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command);
        }else{
            console.log(`command at ${filePath} doesnt have data or execute property :C`);
        }
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} >:0000`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if(interaction.replied || interaction.deferred){
            await interaction.followUp({
                content: 'Sum error whoopsie daisy',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'Whoopsie daisy yoohoo (error)',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);