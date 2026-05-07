// src/commands/join.js
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Memanggil KERNEL untuk masuk ke Voice Channel kamu saat ini.'),
        
    async execute(interaction, client) {
        // 1. Cek apakah user yang mengetik command sedang berada di voice channel
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ 
                content: '⚠️ **[AKSES DITOLAK]** Kamu harus berada di dalam Voice Channel terlebih dahulu agar KERNEL tahu harus menyusul ke mana!', 
                ephemeral: true 
            });
        }

        try {
            // 2. Koneksikan bot ke Voice Channel tersebut
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true // Mode hemat bandwidth (Bot otomatis tutup headset)
            });

            await interaction.reply({ content: `✅ **[SYS_LOG]** KERNEL berhasil terhubung dan menetap di **${voiceChannel.name}**.` });
            
        } catch (error) {
            console.error('[🔴 ERROR] KERNEL gagal join voice:', error);
            await interaction.reply({ 
                content: '🔴 **[SYSTEM FAULT]** Terjadi kesalahan saat mencoba masuk ke Voice Channel.', 
                ephemeral: true 
            });
        }
    }
};