const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas'); // Mesin Pelukis Profil

// Ganti dengan channel ID datalog Anda
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
        // Tampilkan 'Thinking' karena proses melukis gambar butuh waktu
        await interaction.deferReply(); 

        const target = interaction.options.getUser('target') || interaction.user;
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../../levels.json'), 'utf8'));
        const userData = db[target.id];

        if (!userData) {
            return interaction.editReply({ content: `❌ **Data Kosong.** Sinyal operasional <@${target.id}> belum terdeteksi dalam matriks KERNEL.` });
        }

        try {
            // --- INITIATE PEP (PROTOCOL EVOLUSI PROFIL) ---

            // 1. Buat Kanvas (Sesuai cetak biru: 600x200px)
            const canvas = Canvas.createCanvas(600, 200);
            const ctx = canvas.getContext('2d');

            // 2. Tempel Background: bg_rank.png
            const bgPath = path.join(__dirname, '../../assets/backgrounds/bg_rank.png');
            if (fs.existsSync(bgPath)) {
                const background = await Canvas.loadImage(bgPath);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            } else {
                // Fallback jika background tidak ditemukan
                ctx.fillStyle = '#1e1f22';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 3. Merender Avatar Lingkaran (Left Side)
            // Area avatar: X: 35, Y: 40, Diameter: 120
            ctx.save(); // Simpan state canvas sebelum masking
            ctx.beginPath();
            ctx.arc(35 + 60, 40 + 60, 60, 0, Math.PI * 2, true); // (x, y, radius, startAngle, endAngle)
            ctx.closePath();
            ctx.clip(); // Masking dimulai

            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'png' }));
            ctx.drawImage(avatar, 35, 40, 120, 120);
            ctx.restore(); // Kembalikan state canvas (matikan masking)

            // 4. Injeksi Teks Dinamis (Right Side)
            // Menggunakan font sans-serif default server
            
            // Nama User (Bold)
            ctx.font = 'bold 36px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(target.username, 180, 70);

            // Status // Title (Italic, placeholder "RHT OPERATOR")
            ctx.font = 'italic 18px sans-serif';
            ctx.fillStyle = '#ff9f43'; // Oranye status
            ctx.fillText(`STATUS: [ RHT OPERATOR // KERNEL ]`, 180, 100);

            // Level ("LVL. GOD" -> Placeholder dynamic)
            ctx.font = 'bold 45px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right'; // Teks rata kanan
            ctx.fillText(`LVL. ${userData.level || 0}`, 565, 80);

            // EXP count (Small text)
            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#b2bec3';
            ctx.textAlign = 'right';
            const reqExp = (userData.level || 1) * 100;
            ctx.fillText(`EXP: ${userData.xp || 0} / ${reqExp}`, 565, 120);
            ctx.textAlign = 'left'; // Reset rata teks

            // 5. Gambar Bar XP Oranye
            // Area Bar: X: 180, Y: 130, W: 385, H: 20
            const barWidth = 385;
            const barProgress = (userData.xp / reqExp) * barWidth;
            
            ctx.fillStyle = '#4a4d55'; // Warna background bar kosong
            ctx.fillRect(180, 130, barWidth, 20);

            ctx.fillStyle = '#ff9f43'; // Warna progress bar oranye
            ctx.fillRect(180, 130, barProgress, 20);

            // ==========================================
            // 6. JEJERAN LENCANA (BADGE AREA)
            // Area: Bottom Right (X: 180, Y: 160)
            // ==========================================
            if (userData.unlockedAchievements && userData.unlockedAchievements.length > 0) {
                // Teks Label Kecil
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#636e72';
                ctx.fillText('SECURITY BADGES UNLOCKED:', 180, 162);

                const badgesToDisplay = userData.unlockedAchievements;
                const badgeSize = 32; // Ukuran badge kecil di profil
                const badgeSpacing = 10;
                let currentX = 180;
                let currentY = 170;

                // Maksimal 10 lencana yang ditampilkan (cegah overlap)
                for (let i = 0; i < Math.min(badgesToDisplay.length, 10); i++) {
                    const achId = badgesToDisplay[i];
                    const emblemPath = path.join(__dirname, `../../assets/emblems/${achId}.png`);

                    if (fs.existsSync(emblemPath)) {
                        const emblem = await Canvas.loadImage(emblemPath);
                        ctx.drawImage(emblem, currentX, currentY, badgeSize, badgeSize);
                        currentX += badgeSize + badgeSpacing;
                    }
                }
            }

            // 7. Konversi Kanvas jadi File Gambar
            const rankCard = new AttachmentBuilder(canvas.toBuffer(), { name: `rank-${target.id}.png` });

            // Kirim gambar sebagai respons utama
            await interaction.editReply({ files: [rankCard] });

            // 8. LOG KE DATALOG
            const dataLogChannel = interaction.client.channels.cache.get(dataLogChannelId);
            if (dataLogChannel) {
                const EmbedBuilder = require('discord.js').EmbedBuilder;
                const auditEmbed = new EmbedBuilder()
                    .setColor('#00d8d6')
                    .setTitle('🔍 [TELEMETRY] PROFILE ACCESS')
                    .setDescription(`Operator <@${interaction.user.id}> melakukan diagnostik profil pada <@${target.id}>.`)
                    .setTimestamp();
                await dataLogChannel.send({ embeds: [auditEmbed] });
            }

        } catch (error) {
            console.error('ERROR RENDER RANK PEP:', error);
            return interaction.editReply({ content: '❌ **[SYSTEM FAULT]** Gagal melakukan render profil. Sinyal telemetri terputus.' });
        }
    },
};