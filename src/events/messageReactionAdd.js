// src/events/messageReactionAdd.js
const fs = require('fs');
const path = require('path');
const { checkAchievements } = require('../utils/achievements');

const dbPath = path.join(process.cwd(), 'levels.json');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user, client) {
        // Jangan hitung reaksi dari bot
        if (user.bot) return;

        // Jika data reaksi belum di-cache oleh Discord, ambil dulu
        if (reaction.partial) {
            try { await reaction.fetch(); } catch (error) { return; }
        }

        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }

        const userId = user.id;
        if (!db[userId]) return; // Jika belum pernah ngetik pesan, abaikan dulu

        if (db[userId].reactionCount === undefined) db[userId].reactionCount = 0;
        
        // Tambah jumlah reaksi
        db[userId].reactionCount += 1;

        // Cek Achievement
        await checkAchievements(userId, client, db);

        // Simpan
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
    }
};