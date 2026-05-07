// src/commands/project.js
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project')
        .setDescription('KERNEL Project Management System')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        
        // --- 1. /project start ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Membuka workspace proyek baru.')
                .addStringOption(option => option.setName('nama').setDescription('Nama proyek (tanpa spasi)').setRequired(true))
                .addUserOption(option => option.setName('klien').setDescription('Tag klien/partner untuk proyek ini').setRequired(true))
        )
        
        // --- 2. /project update ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Memperbarui status proyek.')
                .addStringOption(option => 
                    option.setName('status')
                        .setDescription('Pilih status progres saat ini')
                        .setRequired(true)
                        .addChoices(
                            { name: '🛠️ Tahap Development', value: 'Development (Laragon/Local)' },
                            { name: '🐛 Debugging & Testing', value: 'Debugging/Revisi' },
                            { name: '⏳ Menunggu Pembayaran', value: 'Pending Payment' },
                            { name: '✅ Selesai & Deployed', value: 'Completed & Deployed' }
                        )
                )
        )

        // --- 3. /project target (BARU) ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('target')
                .setDescription('Memperbarui Target Tech Stack pada papan informasi.')
                .addStringOption(option => option.setName('tech').setDescription('Tulis Tech Stack (misal: Bootstrap 5.3, Fullstack)').setRequired(true))
        )

        // --- 4. /project finish ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('finish')
                .setDescription('Menutup workspace, membuat arsip HTML, dan menghapus channel.')
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            await interaction.deferReply({ ephemeral: true });
            const projectName = interaction.options.getString('nama');
            const clientUser = interaction.options.getUser('klien');
            const categoryId = client.config.catActiveProjects;

            try {
                const projectChannel = await interaction.guild.channels.create({
                    name: `📁-${projectName}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] },
                        { id: clientUser.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor('#00d8d6')
                    .setTitle(`🌐 PROJECT INITIATED: ${projectName.toUpperCase()}`)
                    .setDescription('Workspace ini dienkripsi secara privat.')
                    .addFields(
                        { name: '👤 Client Entity', value: `<@${clientUser.id}>`, inline: true },
                        { name: '👨‍💻 Lead Dev', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '📊 Status Saat Ini', value: '📝 Pengumpulan Requirements', inline: false },
                        { name: '⚙️ Target Tech Stack', value: '*(Belum ditentukan)*', inline: false } // Index ke-3
                    )
                    .setFooter({ text: 'Gunakan /project update atau /project target' })
                    .setTimestamp();

                const pinnedMessage = await projectChannel.send({ content: `<@${clientUser.id}> Workspace siap.`, embeds: [embed] });
                await pinnedMessage.pin();
                await interaction.editReply(`✅ Workspace berhasil dibuat: <#${projectChannel.id}>`);
            } catch (error) {
                console.error(error);
                await interaction.editReply('🔴 Gagal membuat workspace.');
            }
        }

        if (subcommand === 'update') {
            const newStatus = interaction.options.getString('status');
            try {
                const pinnedMessages = await interaction.channel.messages.fetchPinned();
                const projectBoard = pinnedMessages.last(); 
                if (!projectBoard || !projectBoard.embeds.length) return interaction.reply({ content: '⚠️ Papan proyek tidak ditemukan.', ephemeral: true });

                const newEmbed = EmbedBuilder.from(projectBoard.embeds[0]);
                newEmbed.data.fields[2].value = `**${newStatus}**`;
                newEmbed.setColor('#fbc531'); 
                await projectBoard.edit({ embeds: [newEmbed] });
                await interaction.reply({ content: `✅ Status proyek diperbarui: **${newStatus}**` });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '🔴 Gagal memperbarui status.', ephemeral: true });
            }
        }

        if (subcommand === 'target') {
            const newTech = interaction.options.getString('tech');
            try {
                const pinnedMessages = await interaction.channel.messages.fetchPinned();
                const projectBoard = pinnedMessages.last(); 
                if (!projectBoard || !projectBoard.embeds.length) return interaction.reply({ content: '⚠️ Papan proyek tidak ditemukan.', ephemeral: true });

                const newEmbed = EmbedBuilder.from(projectBoard.embeds[0]);
                newEmbed.data.fields[3].value = `**${newTech}**`; // Ubah field Tech Stack
                await projectBoard.edit({ embeds: [newEmbed] });
                await interaction.reply({ content: `✅ Tech Stack diperbarui: **${newTech}**` });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '🔴 Gagal memperbarui Tech Stack.', ephemeral: true });
            }
        }

        // ==========================================
        // EKSEKUSI: /project finish (RAW LOG GENERATOR V3 - WITH ICONS)
        // ==========================================
        if (subcommand === 'finish') {
            await interaction.deferReply();

            const archiveChannel = interaction.guild.channels.cache.get(client.config.chProjectArchive);
            if (!archiveChannel) {
                return interaction.editReply('⚠️ Channel arsip tidak ditemukan.');
            }

            try {
                await interaction.editReply('🔄 Mengekstrak metadata papan proyek dan menyusun log...');

                const pinnedMessages = await interaction.channel.messages.fetchPinned();
                const projectBoard = pinnedMessages.last(); 

                let clientName = 'Unknown';
                let leadDevName = 'Unknown';
                let finalStatus = 'Unknown';
                let techStack = 'Unknown';

                if (projectBoard && projectBoard.embeds.length > 0) {
                    const fields = projectBoard.embeds[0].fields;
                    if (fields) {
                        clientName = fields[0]?.value.replace(/\*\*/g, '') || 'Unknown';
                        leadDevName = fields[1]?.value.replace(/\*\*/g, '') || 'Unknown';
                        finalStatus = fields[2]?.value.replace(/\*\*/g, '') || 'Unknown';
                        techStack = fields[3]?.value.replace(/\*\*/g, '') || 'Unknown';
                    }
                }

                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                
                // --- HEADER DENGAN ICON & EMOTICON ---
                let logContent = `====================================================\n`;
                logContent += `         🗄️ KERNEL PROJECT ARCHIVE SYSTEM\n`;
                logContent += `====================================================\n`;
                logContent += `[ 🆔 PROJECT IDENTITY ]\n`;
                logContent += `📁 Workspace    : ${interaction.channel.name}\n`;
                logContent += `🔐 Archived By  : ${interaction.user.tag}\n`;
                logContent += `📅 Date closed  : ${new Date().toLocaleString('id-ID')}\n`;
                logContent += `----------------------------------------------------\n`;
                logContent += `[ 📌 FINAL METADATA ]\n`;
                logContent += `👤 Client       : ${clientName}\n`;
                logContent += `👨‍💻 Lead Dev     : ${leadDevName}\n`;
                logContent += `⚙️ Tech Stack   : ${techStack}\n`;
                logContent += `📊 Final Status : ${finalStatus}\n`;
                logContent += `====================================================\n\n`;
                logContent += `[ 💬 COMMUNICATION LOGS ]\n\n`;

                messages.reverse().forEach(m => {
                    const time = m.createdAt.toLocaleTimeString('id-ID');
                    const author = m.user?.username || m.author?.username || 'System';
                    
                    // Tambahkan indikator icon khusus jika itu adalah sistem/bot
                    const userIcon = m.author?.bot ? '🤖' : '💬';
                    const content = m.content ? m.content : '[ 📎 System/Media/Embed ]';
                    
                    logContent += `[${time}] ${userIcon} ${author}: ${content}\n`;
                });

                const attachment = new AttachmentBuilder(Buffer.from(logContent, 'utf-8'), { name: `SYS-LOG-${interaction.channel.name}.txt` });

                const archiveEmbed = new EmbedBuilder()
                    .setColor('#00d8d6') 
                    .setTitle('🗃️ [PROJECT TERMINATED & ARCHIVED]')
                    .setDescription(`Proyek dari workspace **${interaction.channel.name}** telah selesai dan berhasil diekstrak ke dalam format *System Log*.`)
                    .addFields(
                        { name: 'Status Terakhir', value: finalStatus, inline: true },
                        { name: 'Diarsipkan oleh', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setTimestamp();

                await archiveChannel.send({ embeds: [archiveEmbed], files: [attachment] });

                await interaction.editReply('✅ Metadata dan log berhasil diekstrak. Menghancurkan workspace dalam 5 detik...');

                setTimeout(async () => {
                    await interaction.channel.delete('Proyek selesai dan diarsipkan.').catch(() => null);
                }, 5000);

            } catch (error) {
                console.error('ERROR LOGGING:', error);
                await interaction.editReply('🔴 **[SYSTEM FAULT]** Gagal mengekstrak log teks.');
            }
        }
    }
};