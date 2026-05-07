// src/commands/ban.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Mengusir entitas dari server RHT Labs.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(option => option.setName('target').setDescription('Entitas yang akan di-ban').setRequired(true))
        .addStringOption(option => option.setName('alasan').setDescription('Alasan pemblokiran').setRequired(false))
        .addIntegerOption(option => option.setName('durasi').setDescription('Durasi ban (dalam hari). Kosongkan untuk permanen.').setRequired(false)),

    async execute(interaction, client) {
        if (interaction.user.id !== client.config.ownerId) {
            return interaction.reply({ content: '⛔ **[ACCESS DENIED]** Hanya ROOT yang berhak menghapus entitas.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('alasan') || 'Ancaman keamanan sistem.';
        const durationDays = interaction.options.getInteger('durasi'); // Bisa null
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        try {
            // Bisa nge-ban user yang bahkan sudah keluar server (menggunakan ID)
            await interaction.guild.members.ban(targetUser.id, { reason: reason });

            const durationText = durationDays ? `${durationDays} Hari` : 'PERMANEN';

            const embed = new EmbedBuilder()
                .setColor('#ff3f34') // Merah Kritis
                .setTitle('🚫 [ACCESS REVOKED]')
                .setDescription(`Entitas telah diusir secara paksa dari ekosistem RHT Labs.`)
                .addFields(
                    { name: '👤 Target Entity', value: `<@${targetUser.id}> (${targetUser.tag})`, inline: true },
                    { name: '⏱️ Duration', value: durationText, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Terminated by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Jika ada durasi (Temporary Ban), atur timer unban
            if (durationDays) {
                const durationMs = durationDays * 24 * 60 * 60 * 1000;
                
                // KERNEL akan otomatis unban setelah waktu habis
                setTimeout(async () => {
                    try {
                        await interaction.guild.members.unban(targetUser.id, 'Masa hukuman Temporary Ban telah selesai.');
                        console.log(`[SYS_LOG] KERNEL otomatis melepaskan ban untuk ${targetUser.tag}.`);
                    } catch (err) {
                        console.error('[🔴 ERROR] Gagal auto-unban:', err);
                    }
                }, durationMs);
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '🔴 Gagal mengeksekusi ban. Pastikan KERNEL memiliki otoritas tertinggi.', ephemeral: true });
        }
    }
};