const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sweep')
        .setDescription('Protokol pembersihan pesan massal (Max 100 pesan)')
        // Keamanan ROOT: Hanya user dengan hak Manage Messages yang bisa memakai ini
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt => 
            opt.setName('jumlah')
                .setDescription('Jumlah riwayat pesan yang akan dipindai (Max 100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(opt => 
            opt.setName('user')
                .setDescription('Target spesifik user yang pesannya ingin dilenyapkan (Opsional)')
                .setRequired(false))
        .addChannelOption(opt => 
            opt.setName('channel')
                .setDescription('Target channel (Opsional, default: channel saat ini)')
                .setRequired(false)),

    async execute(interaction) {
        // Menggunakan ephemeral agar balasan bot hanya bisa dilihat oleh Anda dan tidak mengotori channel
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger('jumlah');
        const targetUser = interaction.options.getUser('user');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            // 1. Tarik riwayat pesan dari channel target
            const messages = await targetChannel.messages.fetch({ limit: amount });

            // 2. Filter pesan (Jika parameter user diisi, buang pesan dari user lain)
            let messagesToDelete = messages;
            if (targetUser) {
                messagesToDelete = messages.filter(m => m.author.id === targetUser.id);
            }

            // 3. Pengecekan jika tidak ada pesan yang cocok
            if (messagesToDelete.size === 0) {
                return interaction.editReply('📭 **Sweep Gagal:** Tidak ada pesan dari target yang ditemukan dalam jangkauan pemindaian, atau pesan sudah lebih dari 14 hari.');
            }

            // 4. Eksekusi Pemusnahan Massal
            // Parameter 'true' di bawah ini penting agar bot mengabaikan pesan yang > 14 hari (mencegah bot crash)
            const deleted = await targetChannel.bulkDelete(messagesToDelete, true);

            // 5. Laporan Eksekusi (Ke Layar Anda)
            const embed = new EmbedBuilder()
                .setColor('#ff3f34') // Warna merah tanda bahaya/penghapusan
                .setTitle('🧹 SWEEP PROTOCOL EXECUTED')
                .setDescription(`Pembersihan matriks berhasil dilakukan.`)
                .addFields(
                    { name: 'Target Area', value: `<#${targetChannel.id}>`, inline: true },
                    { name: 'Target Entitas', value: targetUser ? `<@${targetUser.id}>` : 'Semua Entitas', inline: true },
                    { name: 'Data Lenyap', value: `${deleted.size} pesan`, inline: true }
                )
                .setFooter({ text: 'KERNEL System Security' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // ==========================================
            // 6. PENGIRIMAN KE DATALOG SERVER
            // ==========================================
            // Ganti angka di bawah dengan ID channel #datalog Anda
            const dataLogChannelId = '1482406935599906836'; 
            const dataLogChannel = interaction.client.channels.cache.get(dataLogChannelId);

            if (dataLogChannel) {
                const auditEmbed = new EmbedBuilder()
                    .setColor('#f1c40f') // Warna kuning peringatan audit
                    .setTitle('⚠️ [AUDIT TRAIL] COMMAND EXECUTED')
                    .addFields(
                        { name: 'Command', value: '`/sweep`', inline: true },
                        { name: 'Operator', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Location', value: `<#${targetChannel.id}>`, inline: true },
                        { name: 'Purged', value: `${deleted.size} messages`, inline: true }
                    )
                    .setFooter({ text: 'rhtlabs Internal Logging System' })
                    .setTimestamp();
                
                await dataLogChannel.send({ embeds: [auditEmbed] });
            }

        } catch (error) {
            console.error('ERROR SWEEP:', error);
            return interaction.editReply('❌ **[SYSTEM FAULT]** Terjadi kesalahan fatal saat mencoba menghapus matriks data.');
        }
    },
};