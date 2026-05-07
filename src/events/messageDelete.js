// src/events/messageDelete.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        // Abaikan jika yang dihapus adalah pesan bot atau pesan tidak memiliki konten
        if (message.author?.bot || !message.content) return;

        const logChannel = message.guild.channels.cache.get(client.config.chLogs);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#ff0000') // Merah untuk peringatan penghapusan
            .setTitle('🗑️ [SYS_LOG] Message Deleted')
            .addFields(
                { name: '👤 Author', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
                { name: '📍 Channel', value: `<#${message.channel.id}>`, inline: true },
                // Memotong teks jika terlalu panjang (batas Discord API)
                { name: '📝 Original Content', value: message.content.length > 1000 ? message.content.slice(0, 1000) + '...' : message.content }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(console.error);
    }
};