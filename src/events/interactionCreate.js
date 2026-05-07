// src/events/interactionCreate.js
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // --- 1. HANDLING SLASH COMMANDS ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`[🔴 ERROR] Gagal mengeksekusi command ${interaction.commandName}:`, error);
                await interaction.reply({ 
                    content: '⚠️ **[SYSTEM FAULT]** Terjadi kesalahan saat memproses perintah.', 
                    ephemeral: true 
                });
            }
        }

        // --- 2. HANDLING BUTTON CLICKS (Tetap sama seperti sebelumnya) ---
        if (interaction.isButton()) {
            if (interaction.customId === 'accept_rules') {
                await interaction.member.roles.remove(client.config.roleGuest).catch(console.error);
                await interaction.reply({ content: '✅ **[AUTH SUCCESS]** Protokol diterima. Silakan menuju <#1482021036093472849> untuk memilih spesialisasimu.', ephemeral: true });
            }

            if (interaction.customId === 'role_tech') {
                await interaction.member.roles.add(client.config.roleResearcher).catch(console.error);
                await interaction.reply({ content: '💻 **[SYSTEM OVERRIDE]** Akses *Researcher* diberikan. Selamat bereksperimen di The Labs!', ephemeral: true });
            }

            if (interaction.customId === 'role_gaming') {
                await interaction.member.roles.add(client.config.roleStalker).catch(console.error);
                await interaction.reply({ content: '🎮 **[SYSTEM OVERRIDE]** Akses *Stalker/Gamer* diberikan. GLHF!', ephemeral: true });
            }
        }
    }
};