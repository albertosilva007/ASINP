require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// Rotas
app.get('/', (req, res) => {
    res.json({
        message: 'API do CuidaFissura - Chat com IA está rodando!',
        status: 'online'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API do Chat CuidaFissura está funcionando'
    });
});

// Rotas do chat
app.use('/api/chat', chatRoutes);
app.use('/api/gemini', geminiRoutes);

// Erro 404
app.use((req, res) => {
    console.log('❌ Rota não encontrada:', req.path);
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('❌ ERRO GLOBAL:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor CuidaFissura rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🤖 API Chat: http://localhost:${PORT}/api/chat/message`);
});
