const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

app.use(cors());

// Sağlık Kontrolü (Kubernetes buna bakacak)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Ana Sayfa
app.get('/', (req, res) => {
    res.send('Merhaba! Backend Microservice Calisiyor! 🍕');
});

// Veritabanı Bağlantısı Testi
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Baglantisi Basarili!'))
    .catch(err => console.error('MongoDB Baglantisi Hatali:', err));

app.listen(PORT, () => {
    console.log(`Backend server ${PORT} portunda calisiyor.`);
});