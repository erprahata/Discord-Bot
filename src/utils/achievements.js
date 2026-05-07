// src/utils/achievements.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ==========================================
// DAFTAR ACHIEVEMENT (KLASIFIKASI KERNEL)
// ==========================================
const KERNEL_ACHIEVEMENTS = [
    // --- TIER 1: BRONZE (#cd7f32) ---
    { id: 'bz_msg_100', name: 'Casual Typer', desc: 'Mengirim total 100 pesan di server.', tier: 'Bronze', color: '#cd7f32', type: 'messages', target: 100 },
    { id: 'bz_react_10', name: 'Give or Take', desc: 'Memberikan 10 reaksi pada pesan.', tier: 'Bronze', color: '#cd7f32', type: 'reactions', target: 10 },
    
    // --- TIER 2: SILVER (#c0c0c0) ---
    { id: 'sv_msg_500', name: 'Active Contributor', desc: 'Mengirim total 500 pesan di server.', tier: 'Silver', color: '#c0c0c0', type: 'messages', target: 500 },
    { id: 'sv_voice_180', name: 'Stay A While and Listen', desc: 'Menghabiskan 180 menit di Voice Channel.', tier: 'Silver', color: '#c0c0c0', type: 'voiceMinutes', target: 180 },

    // --- TIER 3: GOLD (#ffd700) ---
    { id: 'gd_voice_600', name: 'The Frequency', desc: 'Menghabiskan 600 menit (10 jam) di Voice Channel.', tier: 'Gold', color: '#ffd700', type: 'voiceMinutes', target: 600 },

    // --- TIER 4: RED / ETERNAL (#ff0000) ---
    { id: 'rd_msg_5000', name: 'Kernel Sync (Eternal)', desc: 'Mengirim total 5000 pesan. Entitas abadi.', tier: 'Red', color: '#ff0000', type: 'messages', target: 5000 },
];

// ==========================================
// FUNGSI PENGECEKAN & UNLOCK
// ==========================================
async function checkAchievements(userId, client, db) {
    const userData = db[userId];
    if (!userData) return;

    // Pastikan struktur array achievements ada di database user
    if (!userData.unlockedAchievements) userData.unlockedAchievements = [];

    let dbUpdated = false;

    for (const ach of KERNEL_ACHIEVEMENTS) {
        // Jika belum pernah di-unlock
        if (!userData.unlockedAchievements.includes(ach.id)) {
            // Cek apakah target terpenuhi sesuai tipenya
            let isUnlocked = false;
            if (ach.type === 'messages' && userData.messageCount >= ach.target) isUnlocked = true;
            if (ach.type === 'reactions' && userData.reactionCount >= ach.target) isUnlocked = true;
            if (ach.type === 'voiceMinutes' && userData.voiceMinutes >= ach.target) isUnlocked = true;

            if (isUnlocked) {
                // Simpan ke memori user
                userData.unlockedAchievements.push(ach.id);
                dbUpdated = true;

                const achieveChannel = client.channels.cache.get(client.config.chAchievements);
                if (!achieveChannel) continue;

                // Kirim Notifikasi Keren bergaya Cyberpunk/MEE6
                const embed = new EmbedBuilder()
                    .setColor(ach.color)
                    .setTitle(`🏆 ACHIEVEMENT UNLOCKED: ${ach.tier} TIER`)
                    .setDescription(`**<@${userId}>** baru saja membuka pencapaian baru!`)
                    .addFields({ name: `[ ${ach.name} ]`, value: ach.desc })
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3112/3112946.png') // Bisa diganti icon piala custom Anda
                    .setTimestamp();

                await achieveChannel.send({ embeds: [embed] }).catch(console.error);
            }
        }
    }

    return dbUpdated; // Kembalikan nilai true jika ada perubahan agar file JSON disave
}

module.exports = { KERNEL_ACHIEVEMENTS, checkAchievements };