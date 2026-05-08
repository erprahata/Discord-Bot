const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { KERNEL_ACHIEVEMENTS, checkAchievements } = require('../utils/achievements');

// Database path
const levelsPath = path.join(__dirname, '../../levels.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Root Protocol: Injeksi poin dan achievement ke operator')
        // Keamanan: Hanya Administrator yang bisa melihat command ini di menu
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => 
            opt.setName('target')
                .setDescription('Operator yang akan diberikan poin')
                .setRequired(true))
        .addStringOption(opt => 
            opt.setName('code')
                .setDescription('Kode Achievement (Contoh: bz_msg_50)')
                .setRequired(true)),

    async execute(interaction) {
        // --- HARD SECURITY CHECK ---
        // Ganti 'ID_DISCORD_ANDA' dengan ID Discord asli Anda agar benar-benar hanya Anda yang bisa akses
        const DEVELOPER_ID = '729357135426617374A'; 
        if (interaction.user.id !== DEVELOPER_ID) {
            return interaction.reply({ 
                content: '❌ **[ACCESS DENIED]** Anda tidak memiliki hak akses ROOT untuk protokol ini.', 
                ephemeral: true 
            });
        }

        const targetUser = interaction.options.getUser('target');
        const achCode = interaction.options.getString('code');

        // 1. Cari data achievement berdasarkan kode
        const achievement = KERNEL_ACHIEVEMENTS.find(a => a.id === achCode);
        if (!achievement) {
            return interaction.reply({ 
                content: `❌ Kode achievement \`${achCode}\` tidak terdaftar dalam matriks KERNEL.`, 
                ephemeral: true 
            });
        }

        // 2. Baca Database Levels
        let db = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
        if (!db[targetUser.id]) {
            return interaction.reply({ content: '❌ User tersebut belum terdaftar dalam database matriks.', ephemeral: true });
        }

        const prevPoints = db[targetUser.id][achievement.type] || 0;
        const boostAmount = achievement.target;

        // 3. Eksekusi Injeksi Poin
        // Sesuai permintaan Anda: Menambah poin sejumlah target achievement tersebut
        if (achievement.type === 'messages') db[targetUser.id].messageCount += boostAmount;
        if (achievement.type === 'reactions') db[targetUser.id].reactionCount += boostAmount;
        if (achievement.type === 'voiceMinutes') db[targetUser.id].voiceMinutes += boostAmount;

        const newPoints = db[targetUser.id][achievement.type];

        // 4. Jalankan Protokol Check Achievement (Untuk trigger unlock kartu gambar)
        // Fungsi ini akan otomatis memberikan semua achievement yang poinnya sudah tercapai
        const isUpdated = await checkAchievements(targetUser.id, interaction.client, db);

        // 5. Simpan Perubahan ke Database
        fs.writeFileSync(levelsPath, JSON.stringify(db, null, 2));

        // 6. Laporan Eksekusi
        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('⚡ [ ROOT PROTOCOL: POINT INJECTION ]')
            .setDescription(`Injeksi poin berhasil dilakukan ke matriks <@${targetUser.id}>.`)
            .addFields(
                { name: 'Target Achievement', value: `\`${achievement.name}\``, inline: true },
                { name: 'Poin Disuntikkan', value: `+${boostAmount} ${achievement.type}`, inline: true },
                { name: 'Status Poin Sekarang', value: `${newPoints} ${achievement.type}`, inline: false }
            )
            .setFooter({ text: 'KERNEL System Admin Access' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};