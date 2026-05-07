// src/utils/server.js
const express = require('express');
const app = express();

function keepAlive() {
    app.get('/', (req, res) => {
        res.send('KERNEL System is Online 24/7');
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`[🌐 WEB] Keep-alive server berjalan di port ${port}`);
    });
}

module.exports = keepAlive;