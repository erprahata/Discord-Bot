const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const afkFilePath = path.join(__dirname, '../../afk.json');

// Pembaca dan penyimpan data AFK
function readAFK() {
    if (!fs.existsSync(afkFilePath)) return {};
    return JSON.parse(fs.readFileSync(afkFilePath, 'utf8'));
}

function saveAFK(data) {
    fs.writeFileSync(afkFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Protokol Status Away From Keyboard (AFK)')
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Tetapkan status AFK Anda')
                .addStringOption(opt => 
                    opt.setName('alasan')
                        .setDescription('Tujuan/Alasan Anda meninggalkan matriks (Opsional)')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('return')
                .setDescription('Cabut status AFK dan kembali aktif')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        let afkData = readAFK();

        // ==========================================
        // EKSEKUSI: /afk set
        // ==========================================
        if (subcommand === 'set') {
            const reason = interaction.options.getString('alasan') || 'Kehilangan koneksi dengan sistem...';
            const timestamp = Math.floor(Date.now() / 1000); // Format waktu Discord Unix

            // Simpan data AFK
            afkData[userId] = {
                reason: reason,
                time: timestamp
            };
            saveAFK(afkData);

            // Membuat Kartu AFK bergaya Cyberpunk
            const afkEmbed = new EmbedBuilder()
                .setColor('#ff9f43') // Warna oranye peringatan
                .setAuthor({ 
                    name: `SYSTEM ALERT: ${interaction.user.username} is offline`, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                })
                .setTitle('⏸️ AFK PROTOCOL INITIATED')
                .setDescription(`Operator <@${userId}> telah meninggalkan Voice / Workstation.`)
                .addFields(
                    { name: 'Keterangan', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: 'Waktu Kepergian', value: `<t:${timestamp}:R>`, inline: true }
                )
                .setThumbnail('https://cdn-icons-png.flaticon.com/512/1533/1533110.png') // Ikon idle/kopi
                .setFooter({ text: 'rhtlabs Digital Team System' })
                .setTimestamp();

            return interaction.reply({ embeds: [afkEmbed] });
        }

        // ==========================================
        // EKSEKUSI: /afk return
        // ==========================================
        if (subcommand === 'return') {
            if (!afkData[userId]) {
                return interaction.reply({ content: '⚠️ Anda tidak sedang dalam status AFK.', ephemeral: true });
            }

            const timeAway = afkData[userId].time;

            // Hapus data AFK
            delete afkData[userId];
            saveAFK(afkData);

            // Membuat Kartu Return
            const returnEmbed = new EmbedBuilder()
                .setColor('#2ecc71') // Warna hijau sukses
                .setAuthor({ 
                    name: `CONNECTION RESTORED: ${interaction.user.username}`, 
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                })
                .setTitle('▶️ OPERATOR ONLINE')
                .setDescription(`Sinyal dari <@${userId}> kembali terdeteksi.`)
                .addFields(
                    { name: 'Durasi AFK', value: `Telah kembali sejak pergi <t:${timeAway}:R>`, inline: false }
                )
                .setFooter({ text: 'rhtlabs Digital Team System' })
                .setTimestamp();

            return interaction.reply({ embeds: [returnEmbed] });
        }
    },
};