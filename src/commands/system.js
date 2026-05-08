const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os'); // Modul bawaan Node.js untuk membaca spesifikasi hardware server

module.exports = {
    data: new SlashCommandBuilder()
        .setName('system')
        .setDescription('Protokol diagnostik server dan telemetri KERNEL')
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Tampilkan telemetri, penggunaan RAM, dan uptime KERNEL saat ini')),

    async execute(interaction) {
        // Menggunakan deferReply untuk memberi waktu sistem mengukur Network Latency (Ping)
        await interaction.deferReply(); 

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'status') {
            try {
                // 1. Kalkulasi Jaringan (Latency & Ping)
                const reply = await interaction.fetchReply();
                const botLatency = reply.createdTimestamp - interaction.createdTimestamp; // Waktu tempuh pesan
                const apiPing = interaction.client.ws.ping; // Kecepatan API Discord

                // 2. Kalkulasi Beban Memori (RAM)
                const memoryUsage = process.memoryUsage();
                const ramUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2); // Dikonversi ke Megabytes

                // 3. Kalkulasi Uptime (Waktu Hidup Bot)
                let totalSeconds = (interaction.client.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                totalSeconds %= 86400;
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = Math.floor(totalSeconds % 60);
                const uptimeString = `${days} Hari, ${hours} Jam, ${minutes} Menit, ${seconds} Detik`;

                // 4. Deteksi Hardware Server (Hosting Anda)
                const osType = os.type();
                const osRelease = os.release();
                const cpuModel = os.cpus()[0].model;
                const cpuCores = os.cpus().length;

                // 5. Perakitan Interface (HUD)
                const embed = new EmbedBuilder()
                    .setColor('#00d8d6') // RHT Labs Cyan
                    .setTitle('🎛️ [ SYS-STAT: TELEMETRY & DIAGNOSTICS ]')
                    .setDescription('Status operasional Node.js dan parameter infrastruktur *hosting* saat ini.')
                    .addFields(
                        { name: '📡 Network Connection', value: `\`\`\`yaml\nAPI Ping   : ${apiPing}ms\nBot Latency: ${botLatency}ms\n\`\`\``, inline: false },
                        { name: '💾 Memory Load', value: `\`\`\`yaml\nHeap Used: ${ramUsedMB} MB\n\`\`\``, inline: true },
                        { name: '⏱️ System Uptime', value: `\`\`\`yaml\n${uptimeString}\n\`\`\``, inline: true },
                        { name: '🖥️ Host Environment', value: `\`\`\`yaml\nOS Kernel : ${osType} ${osRelease}\nProcessor : ${cpuModel} (${cpuCores} Cores)\n\`\`\``, inline: false }
                    )
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setFooter({ text: 'rhtlabs Core Architecture' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('ERROR SYS-STAT:', error);
                return interaction.editReply('🔴 **[SYSTEM FAULT]** Gagal menarik data telemetri dari server.');
            }
        }
    },
};