// src/events/messageCreate.js
const { checkAchievements } = require('../utils/achievements');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Set memori sementara untuk cooldown EXP (1 menit)
const expCooldowns = new Set();
const dbPath = path.join(process.cwd(), 'levels.json');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // ==========================================
        // 1. SISTEM EXP & LEVELING
        // ==========================================
        // Jika yang ngetik adalah Owner (Anda), abaikan perhitungan EXP
        // karena kartu Anda otomatis akan "Rata Kanan" di command /rank
        if (message.author.id !== client.config.ownerId) {
            
            // Cek apakah user sedang dalam masa cooldown
            if (!expCooldowns.has(message.author.id)) {
                
                // Baca database JSON
                let db = {};
                if (fs.existsSync(dbPath)) {
                    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                }

                const userId = message.author.id;
                
                // Jika user belum ada di database, buat profil baru
                if (!db[userId]) {
                    db[userId] = { 
                        exp: 0, level: 1, 
                        messageCount: 0, reactionCount: 0, voiceMinutes: 0, 
                        unlockedAchievements: [] 
                    };
                } else {
                    // Migrasi aman jika user sudah ada tapi stat barunya belum ada
                    if (db[userId].messageCount === undefined) db[userId].messageCount = 0;
                    if (db[userId].reactionCount === undefined) db[userId].reactionCount = 0;
                    if (db[userId].voiceMinutes === undefined) db[userId].voiceMinutes = 0;
                    if (!db[userId].unlockedAchievements) db[userId].unlockedAchievements = [];
                }

                // 1. TAMBAHKAN MESSAGE COUNT
                db[userId].messageCount += 1;

                // 2. CEK ACHIEVEMENT (Apakah pesan ke-100?)
                const hasNewAchievement = await checkAchievements(userId, client, db);

                // Berikan EXP acak antara 15 sampai 25
                const expGained = Math.floor(Math.random() * 11) + 15;
                db[userId].exp += expGained;

                // Formula Level (Level * 100 EXP untuk naik ke level selanjutnya)
                const expNeeded = db[userId].level * 100;

                // Cek apakah EXP cukup untuk naik level
                if (db[userId].exp >= expNeeded) {
                    db[userId].level += 1;
                    db[userId].exp -= expNeeded; // Sisa EXP dibawa ke level berikutnya
                    
                    message.channel.send(`⚡ **[SYSTEM UPGRADE]** <@${userId}> telah mencapai **Level ${db[userId].level}**!`);
                }

                // Simpan kembali ke database JSON
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

                // Masukkan user ke daftar cooldown
                expCooldowns.add(userId);
                setTimeout(() => {
                    expCooldowns.delete(userId);
                }, 30000); // 30.000 ms = 30 detik
            }
        }

        // ==========================================
        // 2. PREFIX COMMANDS LAMA (Tetap dibiarkan di sini)
        // ==========================================
        if (message.content === '!setuprules') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('accept_rules').setLabel('✅ ACCEPTS PROTOCOL').setStyle(ButtonStyle.Success));
            const embed = new EmbedBuilder().setColor('#00ff00').setTitle('🔐 SYSTEM AUTHENTICATION').setDescription('Klik tombol di bawah ini untuk menyetujui Rules of Conduct.');
            await message.channel.send({ embeds: [embed], components: [row] });
            message.delete();
        }

        if (message.content === '!setuproles') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('role_tech').setLabel('💻 TECH (RESEARCHER)').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('role_gaming').setLabel('🎮 GAMING (STALKER)').setStyle(ButtonStyle.Danger)
            );
            const embed = new EmbedBuilder().setColor('#ff9ff3').setTitle('🎭 IDENTITAS ENTITAS').setDescription('Pilih spesialisasi utama kamu di RHT Labs:');
            await message.channel.send({ embeds: [embed], components: [row] });
            message.delete();
        }

        // (Command !announ, !help, !testwelcome dsb bisa Anda biarkan di bawah sini seperti sebelumnya)
    }
};