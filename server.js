const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'reservations.json');

app.use(express.json());
app.use(express.static(__dirname));

// 讀取資料
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// 寫入資料
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 取得所有預約
app.get('/api/reservations', (req, res) => {
    res.json(readData());
});

// 新增預約
app.post('/api/reservations', (req, res) => {
    const reservations = readData();
    const newRes = req.body;
    newRes.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    reservations.push(newRes);
    writeData(reservations);
    res.json({ success: true, data: newRes });
});

app.listen(PORT, () => {
    console.log(`伺服器運行於 http://localhost:${PORT}`);
});
