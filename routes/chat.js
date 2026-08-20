const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

console.log('🔵 Módulo routes/chat.js carregado!');

// Inicializa o cliente Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

console.log('🔵 Cliente Groq inicializado!');

const SYSTEM_PROMPT = `Você é um assistente virtual especializado em fissura labiopalatina (também conhecida como lábio leporino ou fenda palatina). 

Seu papel é:
- Fornecer informações claras e acessíveis sobre a condição
- Apoiar emocionalmente familiares e pacientes
- Orientar sobre cuidados com alimentação, fonoaudiologia, ortodontia e cirurgias
- SEMPRE recomendar consultar profissionais de saúde especializados para diagnóstico e tratamento

Responda em português brasileiro de forma empática, clara e informativa.`;

router.post('/message', async (req, res) => {
    console.log('🔵🔵🔵 ROTA /message CHAMADA! 🔵🔵🔵');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));

    try {
        const { message, conversationHistory } = req.body;

        if (!message) {
            console.log('❌ Mensagem vazia');
            return res.status(400).json({
                success: false,
                error: 'Mensagem é obrigatória'
            });
        }

        const history = conversationHistory || [];
        console.log('📝 Histórico tem', history.length, 'mensagens');

        console.log('🤖 Chamando API Groq...');

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history,
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        console.log('✅ Groq respondeu!');

        const assistantMessage = chatCompletion.choices[0]?.message?.content;

        if (!assistantMessage) {
            console.log('❌ Resposta vazia do Groq');
            throw new Error('Resposta vazia da API');
        }

        const updatedHistory = [
            ...history,
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
        ];

        console.log('💬 Enviando resposta:', assistantMessage.substring(0, 100) + '...');

        res.json({
            success: true,
            message: assistantMessage,
            conversationHistory: updatedHistory
        });

    } catch (error) {
        console.error('❌❌❌ ERRO CRÍTICO! ❌❌❌');
        console.error('Tipo:', error.constructor.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            error: 'Erro ao processar mensagem',
            details: error.message
        });
    }
});

router.post('/clear', (req, res) => {
    console.log('🗑️ Limpando histórico');
    res.json({ success: true, message: 'Histórico limpo' });
});

console.log('🔵 Rotas do chat registradas!');

module.exports = router;