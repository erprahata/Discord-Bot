const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Target file JSON untuk database lokal
const tasksFilePath = path.join(__dirname, '../../tasks.json');

// Fungsi pembantu untuk membaca data
function readTasks() {
    if (!fs.existsSync(tasksFilePath)) return {};
    return JSON.parse(fs.readFileSync(tasksFilePath, 'utf8'));
}

// Fungsi pembantu untuk menyimpan data
function saveTasks(data) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Manajemen Task Matrix Proyek')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Tambah tugas baru ke matriks')
                .addStringOption(opt => opt.setName('deskripsi').setDescription('Isi tugas').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Tampilkan daftar tugas di channel ini'))
        .addSubcommand(sub =>
            sub.setName('done')
                .setDescription('Tandai tugas sebagai selesai berdasarkan ID')
                .addIntegerOption(opt => opt.setName('id').setDescription('ID tugas').setRequired(true)))
        // --- INJEKSI BARU: SUBCOMMAND DELETE ---
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Hapus tugas dari matriks secara permanen')
                .addIntegerOption(opt => opt.setName('id').setDescription('ID tugas yang ingin dihapus').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channelId = interaction.channel.id;
        let tasksData = readTasks();

        // Inisialisasi array kosong jika channel belum punya matrix
        if (!tasksData[channelId]) tasksData[channelId] = [];

        // ==========================================
        // CREATE: /task add
        // ==========================================
        if (subcommand === 'add') {
            const desc = interaction.options.getString('deskripsi');
            
            // Logika ID dinamis: Cari ID tertinggi yang ada, lalu tambah 1 (mencegah ID duplikat jika ada yang dihapus)
            const currentTasks = tasksData[channelId];
            const newId = currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.id)) + 1 : 1;
            
            const newTask = {
                id: newId,
                text: desc,
                completed: false,
                author: interaction.user.username
            };

            tasksData[channelId].push(newTask);
            saveTasks(tasksData);

            return interaction.reply({ content: `✅ **Task Matrix Updated.** Entri baru: \`${desc}\` (ID: ${newId}) berhasil diinjeksi.` });
        }

        // ==========================================
        // READ: /task list
        // ==========================================
        if (subcommand === 'list') {
            const currentTasks = tasksData[channelId];

            if (currentTasks.length === 0) {
                return interaction.reply('📭 **Task Matrix Empty.** Belum ada tugas yang direkam di workspace ini.');
            }

            const embed = new EmbedBuilder()
                .setColor('#00d8d6') 
                .setTitle(`📊 [ TASK MATRIX : ${interaction.channel.name.toUpperCase()} ]`)
                .setDescription('Gunakan `/task done [ID]` untuk menyelesaikan dan `/task delete [ID]` untuk menghapus.')
                .setTimestamp();

            let taskListString = "";
            currentTasks.forEach(t => {
                const statusIcon = t.completed ? '🟦' : '⬜';
                const textStyle = t.completed ? `~~${t.text}~~` : `**${t.text}**`;
                taskListString += `\`ID: ${t.id}\` ${statusIcon} ${textStyle} \n`;
            });

            embed.addFields({ name: 'Current Objectives:', value: taskListString });

            return interaction.reply({ embeds: [embed] });
        }

        // ==========================================
        // UPDATE: /task done
        // ==========================================
        if (subcommand === 'done') {
            const taskId = interaction.options.getInteger('id');
            const taskIndex = tasksData[channelId].findIndex(t => t.id === taskId);

            if (taskIndex === -1) {
                return interaction.reply(`❌ **[404]** ID \`${taskId}\` tidak ditemukan dalam matriks channel ini.`);
            }

            tasksData[channelId][taskIndex].completed = true;
            saveTasks(tasksData);

            return interaction.reply({ content: `🔹 **Objective Secured.** Task ID \`${taskId}\` telah ditandai selesai.` });
        }

        // ==========================================
        // DELETE: /task delete
        // ==========================================
        if (subcommand === 'delete') {
            const taskId = interaction.options.getInteger('id');
            const taskIndex = tasksData[channelId].findIndex(t => t.id === taskId);

            if (taskIndex === -1) {
                return interaction.reply(`❌ **[ERROR]** Task ID \`${taskId}\` tidak valid atau sudah dihapus.`);
            }

            // Simpan nama tugas untuk log notifikasi sebelum dihilangkan
            const taskName = tasksData[channelId][taskIndex].text;

            // Operasi array splice untuk menghapus 1 elemen pada index yang ditentukan
            tasksData[channelId].splice(taskIndex, 1);
            saveTasks(tasksData);

            return interaction.reply({ content: `🗑️ **Data Purged.** Tugas \`${taskName}\` (ID: ${taskId}) telah dihapus permanen dari matriks.` });
        }
    },
};