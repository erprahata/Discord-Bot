// src/events/voiceStateUpdate.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { checkAchievements } = require('../utils/achievements');

const dbPath = path.join(process.cwd(), 'levels.json');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const member = newState.member;
        if (!member) return;

        // ==========================================
        // 1. SISTEM DYNAMIC VOICE CHANNEL
        // ==========================================
        if (newState.channelId && client.config.voiceGenerators.includes(newState.channelId)) {
            const categoryId = newState.channel.parentId;
            try {
                const newChannel = await newState.guild.channels.create({
                    name: `🎙️ Room ${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: member.user.id,
                            allow: [
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.MuteMembers,
                                PermissionsBitField.Flags.DeafenMembers,
                                PermissionsBitField.Flags.MoveMembers
                            ],
                        },
                    ]
                });
                client.tempVoiceChannels.add(newChannel.id);
                await member.voice.setChannel(newChannel);
                console.log(`[SYS_LOG] 🎙️ Room dibuat untuk: ${member.user.username}`);
            } catch (error) {
                console.error('[🔴 ERROR] KERNEL gagal membuat Dynamic Voice:', error);
            }
        }

        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const oldChannel = oldState.channel;
            if (oldChannel && client.tempVoiceChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
                try {
                    await oldChannel.delete();
                    client.tempVoiceChannels.delete(oldChannel.id);
                    console.log(`[SYS_LOG] 🗑️ Room otomatis dihapus karena kosong.`);
                } catch (error) {
                    console.error('[🔴 ERROR] KERNEL gagal menghapus Dynamic Voice:', error);
                }
            }
        }

        // ==========================================
        // 2. SISTEM VOICE TRACKER & ACHIEVEMENT
        // ==========================================
        if (member.user.bot) return; // Abaikan bot

        // Kondisi A: Member MASUK ke Voice Channel (dari luar)
        if (!oldState.channelId && newState.channelId) {
            // Mulai stopwatch
            client.voiceJoinTimes.set(member.id, Date.now());
        }

        // Kondisi B: Member KELUAR dari Voice Channel (disconnect sepenuhnya)
        if (oldState.channelId && !newState.channelId) {
            const joinTime = client.voiceJoinTimes.get(member.id);
            
            if (joinTime) {
                // Hitung durasi dalam milidetik, ubah ke menit
                const durationMs = Date.now() - joinTime;
                const durationMinutes = Math.floor(durationMs / 60000);

                // Hapus memori stopwatch
                client.voiceJoinTimes.delete(member.id);

                // Jika kurang dari 1 menit, abaikan agar tidak spam database
                if (durationMinutes >= 1) {
                    let db = {};
                    if (fs.existsSync(dbPath)) {
                        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                    }

                    if (!db[member.id]) {
                        db[member.id] = { exp: 0, level: 1, messageCount: 0, reactionCount: 0, voiceMinutes: 0, unlockedAchievements: [] };
                    }
                    if (db[member.id].voiceMinutes === undefined) db[member.id].voiceMinutes = 0;

                    // Tambahkan durasi ke database
                    db[member.id].voiceMinutes += durationMinutes;

                    // Cek Achievement (Notifikasi dikirim ke Channel Welcome sebagai channel public/general)
                    await checkAchievements(member.id, client, db);

                    // Simpan data
                    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
                    console.log(`[SYS_LOG] ⏱️ ${member.user.username} menghabiskan ${durationMinutes} menit di Voice.`);
                }
            }
        }
    }
};