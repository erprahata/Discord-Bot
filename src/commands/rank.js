// src/commands/rank.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Melihat identitas entitas dan status level di KERNEL.'),
        
    async execute(interaction, client) {
        // Tunda reply karena Canvas butuh waktu memproses gambar
        await interaction.deferReply();

        const target = interaction.user;
        const isOwner = target.id === client.config.ownerId; // Deteksi "Cheat"

        let userLevel = 1;
        let userExp = 0;
        let expNeeded = 100;

        // Jika BUKAN Owner, ambil data asli dari database
        if (!isOwner) {
            const dbPath = path.join(process.cwd(), 'levels.json');
            if (fs.existsSync(dbPath)) {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                if (db[target.id]) {
                    userLevel = db[target.id].level;
                    userExp = db[target.id].exp;
                    expNeeded = userLevel * 100;
                }
            }
        }

        // ==========================================
        // KONFIGURASI STATUS KARTU (OWNER vs MEMBER)
        // ==========================================
        const displayLevel = isOwner ? 'GOD' : userLevel;
        const titleText = isOwner ? 'SYSADMIN // XIANZ' : 'AUTHENTICATED ENTITY';
        const currentExp = isOwner ? 9999 : userExp;
        const maxExp = isOwner ? 9999 : expNeeded;
        const themeColor = isOwner ? '#ff9f43' : '#00d8d6'; // Owner = Orange, Member = Cyan

        // ==========================================
        // RENDERING CANVAS CYBERPUNK
        // ==========================================
        const canvas = Canvas.createCanvas(800, 250);
        const ctx = canvas.getContext('2d');

        // 1. Latar Belakang Deep Black
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Aksen Cyberpunk (Garis tepi warna)
        ctx.fillStyle = themeColor;
        ctx.fillRect(0, 0, 15, canvas.height); // Garis Kiri
        ctx.fillStyle = '#ff3f34'; // Garis Kanan (Merah)
        ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

        // 3. Setup Font
        ctx.font = '28px "TerminalFont", sans-serif'; // Pastikan font terminal-font.ttf masih ada di /assets
        ctx.fillStyle = '#ffffff';
        ctx.fillText(target.username.toUpperCase(), 230, 80);

        ctx.font = '20px "TerminalFont", sans-serif';
        ctx.fillStyle = themeColor;
        ctx.fillText(`STATUS: [ ${titleText} ]`, 230, 120);

        // 4. Tulisan Level & EXP
        ctx.font = '35px "TerminalFont", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LVL. ${displayLevel}`, 600, 80);

        ctx.font = '18px "TerminalFont", sans-serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`EXP: ${currentExp} / ${maxExp}`, 600, 160);

        // 5. Progress Bar Background
        ctx.fillStyle = '#222222';
        ctx.fillRect(230, 175, 500, 30);

        // 6. Progress Bar Terisi
        const progress = isOwner ? 1 : Math.min(currentExp / maxExp, 1);
        ctx.fillStyle = themeColor;
        // Efek Neon pada Bar
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(230, 175, 500 * progress, 30);
        ctx.shadowBlur = 0; // Matikan shadow

        // 7. Avatar (Digambar membulat)
        ctx.beginPath();
        ctx.arc(120, 125, 70, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatarURL = target.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await Canvas.loadImage(avatarURL);
        ctx.drawImage(avatar, 50, 55, 140, 140);

        // ==========================================
        // KIRIM HASIL KE DISCORD
        // ==========================================
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'rank-card.png' });
        
        await interaction.editReply({ files: [attachment] });
    }
};