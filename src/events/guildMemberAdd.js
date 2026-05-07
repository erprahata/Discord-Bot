// src/events/guildMemberAdd.js
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // 1. OTOMATIS BERI ROLE GUEST SAAT JOIN
        await member.roles.add(client.config.roleGuest).catch(console.error);

        const welcomeChannel = member.guild.channels.cache.get(client.config.chWelcome);
        if (!welcomeChannel) return;

        // Register Font menggunakan process.cwd() agar menuju root folder
        const fontPath = path.join(process.cwd(), 'assets', 'terminal-font.ttf');
        if (fs.existsSync(fontPath)) {
            Canvas.registerFont(fontPath, { family: 'TerminalFont' });
        } else {
            console.log('[⚠️ SYSTEM WARNING] Font "terminal-font.ttf" tidak ditemukan!');
        }

        const canvas = Canvas.createCanvas(1024, 450);
        const context = canvas.getContext('2d');
        
        const bgPath = path.join(process.cwd(), 'assets', 'welcome-bg.png');
        if (fs.existsSync(bgPath)) {
            const background = await Canvas.loadImage(bgPath);
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
        } else {
            context.fillStyle = '#121212';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = '32px "TerminalFont", sans-serif';
        context.fillStyle = '#00ff00';
        context.shadowColor = '#00ff00';
        context.shadowBlur = 10;
        
        context.fillText('[SYS_LOG] NEW ENTITY DETECTED', 350, 150);
        
        context.shadowBlur = 0;
        context.fillText('[SYS_LOG] NEW ENTITY DETECTED', 350, 150);

        let fontSize = 70;
        do { context.font = `${fontSize -= 5}px "TerminalFont", sans-serif`; } 
        while (context.measureText(member.user.username).width > canvas.width - 380);
        
        context.fillStyle = '#ffffff';
        context.fillText(member.user.username.toUpperCase(), 350, 240);

        context.font = '28px "TerminalFont", sans-serif';
        context.fillStyle = '#ff00dd';
        context.fillText(`MEMBER #${member.guild.memberCount} // STATUS: UNAUTHENTICATED`, 350, 310);

        context.beginPath();
        context.arc(175, 225, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        const avatarURL = member.user.displayAvatarURL({ extension: 'jpg', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);
        context.drawImage(avatar, 75, 125, 200, 200);

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome-image.png' });

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('⚡ [CONNECTION ESTABLISHED]')
            .setDescription(`>>> Entitas terdeteksi: <@${member.user.id}>\nMemulai protokol inisialisasi...\n\nSilakan verifikasi akses di <#1482020505761353903>.`)
            .setImage('attachment://welcome-image.png')
            .setFooter({ text: 'RHT Labs Security System', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] }).catch(console.error);
    }
};