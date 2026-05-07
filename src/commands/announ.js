// src/commands/announ.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announ')
        .setDescription('Mempublikasikan pengumuman sistem (Hanya Sudoer)')
        // Membuat parameter input untuk isi pengumuman
        .addStringOption(option => 
            option.setName('teks')
                .setDescription('Isi pengumuman (mendukung format Markdown)')
                .setRequired(true))
        // KUNCI KEAMANAN: Command ini akan GAIB bagi user yang tidak bisa Manage Messages
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    async execute(interaction, client) {
        const teks = interaction.options.getString('teks');

        // Mengirim pengumuman ke channel tempat command diketik
        await interaction.channel.send({ content: teks });
        
        // Membalas interaksi secara ephemeral (hanya admin yang bisa lihat balasan suksesnya)
        await interaction.reply({ content: '✅ **[SYS_LOG]** Pengumuman berhasil didistribusikan.', ephemeral: true });
    }
};