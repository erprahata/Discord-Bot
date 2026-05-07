// src/events/messageUpdate.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        // Abaikan bot atau jika pesannya sebenarnya tidak berubah (misal Discord hanya me-render embed link)
        if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

        const logChannel = oldMessage.guild.channels.cache.get(client.config.chLogs);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#ff9f43') // Orange untuk modifikasi
            .setTitle('✏️ [SYS_LOG] Message Edited')
            .addFields(
                { name: '👤 Author', value: `<@${oldMessage.author.id}>`, inline: true },
                { name: '📍 Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
                { name: '🔗 Link', value: `[Jump to Message](${newMessage.url})`, inline: true },
                { name: '⏮️ Before', value: oldMessage.content ? (oldMessage.content.length > 1000 ? oldMessage.content.slice(0, 1000) + '...' : oldMessage.content) : '*(Tidak ada teks)*' },
                { name: '⏭️ After', value: newMessage.content ? (newMessage.content.length > 1000 ? newMessage.content.slice(0, 1000) + '...' : newMessage.content) : '*(Tidak ada teks)*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(console.error);
    }
};