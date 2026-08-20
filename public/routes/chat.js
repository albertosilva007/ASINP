const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Rota para enviar mensagem ao chat
router.post('/message', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Mensagem não pode estar vazia'
            });
        }

        // Preparar histórico de conversa
        const messages = conversationHistory || [];

        // Adicionar mensagem do usuário
        messages.push({
            role: "user",
            content: message
        });

        // System prompt contextualizado para CuidaFissura - fissura labiopalatina
        const systemMessage = {
            role: "system",
            content: `Você é um assistente virtual especializado em saúde para o sistema CuidaFissura, que apoia pacientes e familiares de pessoas com fissura labiopalatina (lábio leporino e/ou fenda palatina).

Seu papel é:
- Fornecer informações sobre fissura labiopalatina, tratamentos e cuidados
- Apoiar emocionalmente pacientes e familiares
- Orientar sobre alimentação, fonoaudiologia, ortodontia e cirurgias
- Esclarecer dúvidas sobre o processo de tratamento
- Ser empático, acolhedor e profissional
- SEMPRE incentivar a consulta com profissionais de saúde para diagnósticos e tratamentos
- Responder em português brasileiro

IMPORTANTE: Você NÃO substitui atendimento médico. Sempre recomende buscar profissionais especializados quando necessário.`
        };

        // Chamada para Groq API
        const completion = await groq.chat.completions.create({
            messages: [systemMessage, ...messages],
            model: "llama-3.1-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        });

        const aiResponse = completion.choices[0].message.content;

        // Adicionar resposta da IA ao histórico
        messages.push({
            role: "assistant",
            content: aiResponse
        });

        res.json({
            success: true,
            response: aiResponse,
            conversationHistory: messages
        });

    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar mensagem. Tente novamente.'
        });
    }
});

// Rota para limpar histórico
router.post('/clear', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Histórico limpo com sucesso'
        });
    } catch (error) {
        console.error('Erro ao limpar chat:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar histórico'
        });
    }
});

module.exports = router;
