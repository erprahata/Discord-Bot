// src/events/ready.js
const { ActivityType, ChannelType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`\n=========================================`);
        console.log(`[🟢 ONLINE] KERNEL System Activated`);
        console.log(`=========================================\n`);
        
        client.user.setPresence({ 
            activities: [{ name: 'RHT Labs Ecosystem', type: ActivityType.Watching }], 
            status: 'online' 
        });

        // 1. FUNGSI UPDATE NETWORK STATUS (Tetap seperti sebelumnya)
        async function updateNetworkStatus() {
            try {
                const guild = await client.guilds.fetch(client.config.guildId);
                if (!guild) return;
                await guild.members.fetch();

                const totalMembers = guild.memberCount;
                const botsCount = guild.members.cache.filter(member => member.user.bot).size;
                const humansCount = totalMembers - botsCount;
                const onlineCount = guild.members.cache.filter(member => 
                    !member.user.bot && member.presence && member.presence.status !== 'offline'
                ).size;

                const channelMembers = guild.channels.cache.get(client.config.chMembers);
                const channelBots = guild.channels.cache.get(client.config.chBots);
                const channelProjects = guild.channels.cache.get(client.config.chProjects); 
                const channelOnline = guild.channels.cache.get(client.config.chOnline);

                if (channelMembers) await channelMembers.setName(`📊 Members: ${humansCount}`);
                if (channelBots) await channelBots.setName(`🤖 System Bots: ${botsCount}`);
                if (channelProjects) await channelProjects.setName(`🚀 Projects: 2`);
                if (channelOnline) await channelOnline.setName(`🟢 Online: ${onlineCount}`);
                
            } catch (error) {
                console.error(`[🔴 ERROR] Update Network Status:`, error);
            }
        }

        // 2. FUNGSI GARBAGE COLLECTOR & RESTORE MEMORY VOICE CHANNEL
        async function scanAndCleanVoiceChannels() {
            try {
                const guild = await client.guilds.fetch(client.config.guildId);
                if (!guild) return;

                // Ambil semua channel di server
                const channels = await guild.channels.fetch();

                // Saring channel yang merupakan Voice Channel dan berawalan "🎙️ Room"
                const dynamicChannels = channels.filter(ch => 
                    ch && 
                    ch.type === ChannelType.GuildVoice && 
                    ch.name.startsWith('🎙️ Room')
                );

                let deletedCount = 0;
                let restoredCount = 0;

                for (const [id, channel] of dynamicChannels) {
                    // Jika room kosong, hancurkan.
                    if (channel.members.size === 0) {
                        await channel.delete('Sistem KERNEL: Cleanup room kosong saat booting.');
                        deletedCount++;
                    } else {
                        // Jika masih ada orang di dalam, pulihkan ID channel ke memori bot
                        client.tempVoiceChannels.add(channel.id);
                        restoredCount++;
                    }
                }

                if (deletedCount > 0 || restoredCount > 0) {
                    console.log(`[SYS_LOG] 🧹 KERNEL Sweep: Menghapus ${deletedCount} room usang & merestore ${restoredCount} room aktif.`);
                }

            } catch (error) {
                console.error('[🔴 ERROR] Gagal melakukan scanning Voice Channel:', error);
            }
        }

        // Jalankan saat bot pertama kali menyala
        scanAndCleanVoiceChannels();
        updateNetworkStatus();

        // Ulangi update status jaringan setiap 5 menit
        setInterval(updateNetworkStatus, 300000);
    },
};