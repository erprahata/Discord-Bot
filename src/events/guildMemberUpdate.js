// src/events/guildMemberUpdate.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const logChannel = newMember.guild.channels.cache.get(client.config.chLogs);
        if (!logChannel) return;

        // 1. CEK PERUBAHAN NICKNAME
        if (oldMember.nickname !== newMember.nickname) {
            const oldName = oldMember.nickname || oldMember.user.username;
            const newName = newMember.nickname || newMember.user.username;

            const embed = new EmbedBuilder()
                .setColor('#00d8d6') // Cyan
                .setTitle('🔄 [SYS_LOG] Identity Updated')
                .setDescription(`<@${newMember.user.id}> telah mengubah Nickname mereka.`)
                .addFields(
                    { name: '⏮️ Old Name', value: oldName, inline: true },
                    { name: '⏭️ New Name', value: newName, inline: true }
                )
                .setTimestamp();
                
            await logChannel.send({ embeds: [embed] }).catch(console.error);
        }

        // 2. CEK PERUBAHAN ROLE (Ditambahkan atau Dihapus)
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Mencari role yang baru ditambahkan
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        // Mencari role yang dicabut
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor('#fbc531') // Kuning
                .setTitle('🔰 [SYS_LOG] Access Level Modified')
                .setDescription(`Update otorisasi untuk <@${newMember.user.id}>:`);

            if (addedRoles.size > 0) {
                embed.addFields({ name: '➕ Role Granted', value: addedRoles.map(r => `<@&${r.id}>`).join(', ') });
            }
            if (removedRoles.size > 0) {
                embed.addFields({ name: '➖ Role Revoked', value: removedRoles.map(r => `<@&${r.id}>`).join(', ') });
            }
            
            embed.setTimestamp();
            await logChannel.send({ embeds: [embed] }).catch(console.error);
        }
    }
};