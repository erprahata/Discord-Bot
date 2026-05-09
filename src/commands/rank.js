const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');

// IMPORT DATA ACHIEVEMENT UNTUK MENDAPATKAN TIER-NYA
const { KERNEL_ACHIEVEMENTS } = require('../utils/achievements'); 

const dataLogChannelId = '1482406935599906836'; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Tampilkan kartu profil dan status KERNEL Anda')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User yang ingin dilihat profilnya (Opsional)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply(); 

        const target = interaction.options.getUser('target') || interaction.user;
        const dbPath = path.join(__dirname, '../../levels.json');
        
        // Cek apakah database ada
        if (!fs.existsSync(dbPath)) {
            return interaction.editReply({ content: '❌ Database belum terbentuk.' });
        }
        
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const userData = db[target.id] || { level: 1, xp: 0, unlockedAchievements: [] };

        // === IDENTIFIKASI ROOT SYSADMIN ===
        const DEVELOPER_ID = '729357135426617374';
        const isOwner = target.id === DEVELOPER_ID;

        try {
            // 1. Buat Kanvas (600x200px)
            const canvas = Canvas.createCanvas(600, 200);
            const ctx = canvas.getContext('2d');

            // 2. Tempel Background
            const bgPath = path.join(__dirname, '../../assets/backgrounds/bg_rank.png');
            if (fs.existsSync(bgPath)) {
                const background = await Canvas.loadImage(bgPath);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#1e1f22';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 3. Merender Avatar Lingkaran (Left Side)
            ctx.save(); 
            ctx.beginPath();
            ctx.arc(35 + 60, 40 + 60, 60, 0, Math.PI * 2, true); 
            ctx.closePath();
            ctx.clip(); 

            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'png' }));
            ctx.drawImage(avatar, 35, 40, 120, 120);
            ctx.restore(); 

            // 4. INJEKSI TEKS DINAMIS
            // Nama User
            ctx.font = 'bold 36px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(target.username, 180, 70);

            // Status Title
            ctx.font = 'italic 18px sans-serif';
            ctx.fillStyle = isOwner ? '#ff0000' : '#ff9f43'; 
            const statusText = isOwner ? 'STATUS: [ SYSADMIN // ROOT KERNEL ]' : 'STATUS: [ RHT OPERATOR // KERNEL ]';
            ctx.fillText(statusText, 180, 100);

            // ==========================================
            // LOGIKA LEVEL & EXP (GOD MODE OVERRIDE)
            // ==========================================
            ctx.font = 'bold 45px sans-serif';
            ctx.textAlign = 'right';

            if (isOwner) {
                // Tampilan Khusus Owner
                ctx.fillStyle = '#ff0000'; // Merah
                ctx.fillText(`LVL. ???`, 565, 80);
                
                ctx.font = '16px sans-serif';
                ctx.fillText(`EXP: MAX / MAX`, 565, 120);
            } else {
                // Tampilan Member Biasa
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`LVL. ${userData.level}`, 565, 80);
                
                ctx.font = '16px sans-serif';
                ctx.fillStyle = '#b2bec3';
                const reqExp = userData.level * 100;
                ctx.fillText(`EXP: ${userData.xp} / ${reqExp}`, 565, 120);
            }
            ctx.textAlign = 'left'; // Reset rata kiri untuk baris selanjutnya

            // ==========================================
            // LOGIKA BAR EXP
            // ==========================================
            const barWidth = 385;
            let barProgress = 0;
            
            if (isOwner) {
                barProgress = barWidth; // Mentok Kanan
            } else {
                const reqExp = userData.level * 100;
                barProgress = Math.min((userData.xp / reqExp) * barWidth, barWidth);
            }

            // Background Bar
            ctx.fillStyle = '#4a4d55'; 
            ctx.fillRect(180, 130, barWidth, 20);

            // Progress Bar (Merah untuk owner, Oranye untuk user biasa)
            ctx.fillStyle = isOwner ? '#ff0000' : '#ff9f43'; 
            ctx.fillRect(180, 130, barProgress, 20);

            // ==========================================
            // REFINEMENT: SORTIR & LIMITASI LENCANA
            // ==========================================
            if (userData.unlockedAchievements && userData.unlockedAchievements.length > 0) {
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#636e72';
                ctx.fillText('SECURITY BADGES UNLOCKED:', 180, 162);

                // 1. Berikan bobot pada tiap tier untuk keperluan sorting
                const tierWeights = { 'Red': 4, 'Gold': 3, 'Silver': 2, 'Bronze': 1 };

                // 2. Petakan ID achievement milik user ke objek aslinya
                let userBadges = userData.unlockedAchievements.map(id => 
                    KERNEL_ACHIEVEMENTS.find(ach => ach.id === id)
                ).filter(Boolean); // Filter untuk mencegah error undefined

                // 3. Sortir dari tier terberat (Red) ke terendah (Bronze)
                userBadges.sort((a, b) => tierWeights[b.tier] - tierWeights[a.tier]);

                // 4. Tentukan batas maksimal tampilan
                const maxDisplay = 5;
                const badgesToDisplay = userBadges.slice(0, maxDisplay);
                const remainingBadges = userBadges.length - maxDisplay;

                const badgeSize = 32; 
                const badgeSpacing = 10;
                let currentX = 180;
                let currentY = 170;

                // 5. Gambar maksimal 5 lencana tertinggi
                for (let i = 0; i < badgesToDisplay.length; i++) {
                    const ach = badgesToDisplay[i];
                    const emblemPath = path.join(__dirname, `../../assets/emblems/${ach.id}.png`);

                    if (fs.existsSync(emblemPath)) {
                        const emblem = await Canvas.loadImage(emblemPath);
                        ctx.drawImage(emblem, currentX, currentY, badgeSize, badgeSize);
                        currentX += badgeSize + badgeSpacing;
                    }
                }

                // 6. Jika ada sisa, tampilkan teks +X
                if (remainingBadges > 0) {
                    ctx.font = 'bold 18px sans-serif';
                    ctx.fillStyle = '#b2bec3';
                    ctx.fillText(`+${remainingBadges}`, currentX, currentY + 22);
                }
            }

            // Konversi & Kirim Gambar
            const rankCard = new AttachmentBuilder(canvas.toBuffer(), { name: `rank-${target.id}.png` });
            await interaction.editReply({ files: [rankCard] });

        } catch (error) {
            console.error('ERROR RENDER RANK PEP:', error);
            return interaction.editReply({ content: '❌ **[SYSTEM FAULT]** Gagal melakukan render profil.' });
        }
    },
};