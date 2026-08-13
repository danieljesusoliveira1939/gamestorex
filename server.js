const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// E-mail e Chave do Banco Inter configurados
const INTER_PIX_EMAIL = "danieljesusdeo@gmail.com";

// Rota de Jogos
app.get('/api/games', (req, res) => {
  db.all('SELECT * FROM games', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rota de Pagamento Pix Banco Inter
app.post('/api/checkout/inter-pix', (req, res) => {
  const { amount } = req.body;

  // Gerador de QR Code dinâmico para a chave Banco Inter
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(INTER_PIX_EMAIL)}`;

  res.json({
    success: true,
    pixKey: INTER_PIX_EMAIL,
    qrCodeUrl: qrCodeUrl,
    amount: amount
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Jogos rodando em: http://localhost:${PORT}`);
  console.log(`Chave Pix Banco Inter configurada: ${INTER_PIX_EMAIL}`);
});

