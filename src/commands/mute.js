// src/commands/mute.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Menonaktifkan akses komunikasi entitas (Timeout).')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers) // Hanya Admin/Mod
        .addUserOption(option => option.setName('target').setDescription('Entitas yang akan di-mute').setRequired(true))
        .addIntegerOption(option => option.setName('durasi').setDescription('Durasi mute (dalam menit)').setRequired(true))
        .addStringOption(option => option.setName('alasan').setDescription('Alasan pelanggaran').setRequired(false)),

    async execute(interaction, client) {
        // Proteksi Lapis 2: Cek apakah yang pakai command ini adalah Anda (Owner)
        if (interaction.user.id !== client.config.ownerId) {
            return interaction.reply({ content: '⛔ **[ACCESS DENIED]** Hanya ROOT yang bisa mengeksekusi protokol ini.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const durationMinutes = interaction.options.getInteger('durasi');
        const reason = interaction.options.getString('alasan') || 'Pelanggaran keamanan sistem KERNEL.';
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({ content: '⚠️ Entitas tidak ditemukan di dalam server.', ephemeral: true });
        }

        try {
            // Konversi menit ke milidetik
            const durationMs = durationMinutes * 60 * 1000;
            
            // Eksekusi Timeout (Mute)
            await targetMember.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff9f43') // Orange peringatan
                .setTitle('🔇 [COMMS DISABLED]')
                .setDescription(`Sistem KERNEL telah memutus paksa koneksi audio dan teks untuk entitas ini.`)
                .addFields(
                    { name: '👤 Target Entity', value: `<@${targetUser.id}>`, inline: true },
                    { name: '⏱️ Duration', value: `${durationMinutes} Menit`, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Executed by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '🔴 Gagal mengeksekusi mute. Pastikan role KERNEL lebih tinggi dari target.', ephemeral: true });
        }
    }
};