// src/commands/leave.js
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Memerintahkan KERNEL untuk memutus koneksi dan keluar dari Voice.'),
        
    async execute(interaction, client) {
        // 1. Cari koneksi suara bot di server ini
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ 
                content: '⚠️ KERNEL saat ini tidak sedang terhubung ke Voice Channel mana pun.', 
                ephemeral: true 
            });
        }

        // 2. Putus koneksi dan hancurkan status voice-nya
        connection.destroy();
        await interaction.reply({ content: '👋 **[SYS_LOG]** KERNEL memutus koneksi audio dan meninggalkan ruangan.' });
    }
};