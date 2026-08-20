const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Mensagem não pode estar vazia'
            });
        }

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Você é um assistente virtual amigável e prestativo da ASINP (Associação de Apoio de Recife, PE, Brasil).

Informações da ASINP:
- Horário de atendimento: Segunda a Sexta das 8h às 18h, Sábado das 8h às 12h
- Email: contato@asinp.org.br
- Telefone: (81) 3333-4444
- Localização: Recife, Pernambuco

Responda de forma amigável, clara, objetiva, em português do Brasil, com empatia.

Pergunta do usuário: ${message}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.json({
                success: true,
                response: data.candidates[0].content.parts[0].text
            });
        }

        if (data.error) {
            console.error('Erro da API Gemini:', data.error);
            return res.status(502).json({ success: false, error: data.error.message });
        }

        return res.status(502).json({ success: false, error: 'Resposta inválida da API' });
    } catch (error) {
        console.error('Erro no chat Gemini:', error);
        res.status(500).json({ success: false, error: 'Erro ao processar mensagem. Tente novamente.' });
    }
});

module.exports = router;
