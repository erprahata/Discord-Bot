// src/commands/ping.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Definisi Command
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Cek status latensi jaringan KERNEL OS.'),
    
    // Logika Command
    async execute(interaction, client) {
        const pingEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🟢 STATUS: ONLINE')
            .setDescription(`Latensi KERNEL: **${client.ws.ping}ms**`)
            .setTimestamp();

        await interaction.reply({ embeds: [pingEmbed] });
    }
};