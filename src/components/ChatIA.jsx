import React, { useState, useRef, useEffect } from "react";
import "./ChatIA.css";

// Número da equipe ASINP para atendimento humano via WhatsApp
const WHATSAPP_NUMBER = "5581999999999"; // TODO: ajustar para o número real da equipe

const ChatIA = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "🤖 Olá! Sou o assistente virtual da ASINP!\n\n✅ IA Ativada com Gemini 2.5 Flash\n\nComo posso ajudá-lo hoje? 😊",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Configura reconhecimento de voz (fala -> texto), se o navegador suportar
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    setVoiceSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Texto -> voz (lê a resposta em voz alta, útil para quem tem dificuldade de leitura)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    const clean = text.replace(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
      ""
    );
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "pt-BR";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/gemini/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        if (speakReplies) speakText(data.response);
      } else {
        throw new Error(data.error || "Resposta inválida da API");
      }
    } catch (error) {
      console.error("Erro:", error);

      const fallbackText = getOfflineResponse(messageToSend);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: fallbackText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      if (speakReplies) speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const getOfflineResponse = (message) => {
    const msg = message.toLowerCase();

    if (
      msg.includes("oi") ||
      msg.includes("olá") ||
      msg.includes("ola") ||
      msg.includes("bom dia") ||
      msg.includes("boa tarde") ||
      msg.includes("boa noite")
    ) {
      return "😊 Olá! Como posso ajudá-lo hoje?";
    }

    if (
      msg.includes("horário") ||
      msg.includes("horario") ||
      msg.includes("atendimento") ||
      msg.includes("funciona") ||
      msg.includes("abre")
    ) {
      return "⏰ Nosso horário de atendimento:\n\n• Segunda a Sexta: 8h às 18h\n• Sábado: 8h às 12h\n• Domingo: Fechado";
    }

    if (
      msg.includes("contato") ||
      msg.includes("telefone") ||
      msg.includes("email") ||
      msg.includes("falar") ||
      msg.includes("ligar")
    ) {
      return "📞 Entre em contato conosco:\n\n• Email: contato@asinp.org.br\n• Telefone: (81) 3333-4444\n• WhatsApp: (81) 3333-4444";
    }

    if (
      msg.includes("endereço") ||
      msg.includes("endereco") ||
      msg.includes("onde") ||
      msg.includes("local") ||
      msg.includes("fica")
    ) {
      return "📍 Estamos localizados em Recife, PE.\n\nPara mais informações sobre nosso endereço completo, entre em contato:\n• Telefone: (81) 3333-4444\n• Email: contato@asinp.org.br";
    }

    if (
      msg.includes("agendar") ||
      msg.includes("marcar") ||
      msg.includes("consulta") ||
      msg.includes("atendimento")
    ) {
      return "📅 Para agendar:\n\n1. Ligue para: (81) 3333-4444\n2. Ou envie email: contato@asinp.org.br\n\n⏰ Atendimento: Segunda a Sexta, 8h às 18h";
    }

    if (
      msg.includes("obrigad") ||
      msg.includes("valeu") ||
      msg.includes("thanks")
    ) {
      return "😊 Por nada! Fico feliz em ajudar! Se precisar de mais alguma coisa, estou por aqui! 💚";
    }

    if (
      msg.includes("tchau") ||
      msg.includes("adeus") ||
      msg.includes("até") ||
      msg.includes("ate logo") ||
      msg.includes("flw")
    ) {
      return "👋 Até logo! Tenha um ótimo dia! Sempre que precisar, estarei aqui para ajudar! 😊";
    }

    if (
      msg.includes("ajuda") ||
      msg.includes("help") ||
      msg.includes("socorro")
    ) {
      return "🆘 Estou aqui para ajudar!\n\nVocê pode perguntar sobre:\n• ⏰ Horários de atendimento\n• 📞 Informações de contato\n• 📅 Como agendar\n• 📍 Localização\n• ℹ️ Serviços disponíveis\n\nO que você gostaria de saber?";
    }

    return "💬 Desculpe, não entendi muito bem sua pergunta.\n\nℹ️ Posso ajudá-lo com:\n• ⏰ Horários de atendimento\n• 📞 Informações de contato\n• 📅 Agendamentos\n• 📍 Localização\n\nOu ligue diretamente: (81) 3333-4444";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTalkToHuman = () => {
    const text = encodeURIComponent(
      "Olá! Vim pelo assistente virtual da ASINP e gostaria de falar com um profissional da equipe."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <h2 className="chat-title">🤖 Assistente Virtual ASINP</h2>
          <p className="chat-subtitle">Powered by Google Gemini 2.5 Flash ⚡</p>
        </div>
        <button
          className="chat-human-button"
          onClick={handleTalkToHuman}
          title="Falar com um profissional da equipe"
        >
          👩‍⚕️ Falar com profissional
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.type === "user" ? "message-user" : "message-bot"
            }`}
          >
            <div className="message-avatar">
              {message.type === "user" ? "👤" : "🤖"}
            </div>
            <div className="message-content">
              <p className="message-text">{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {voiceSupported && (
          <button
            className={`chat-mic-button ${
              isListening ? "chat-mic-active" : ""
            }`}
            onClick={toggleListening}
            title={isListening ? "Parar gravação" : "Falar sua mensagem"}
            type="button"
          >
            {isListening ? "🔴" : "🎤"}
          </button>
        )}
        <textarea
          className="chat-input"
          placeholder={
            isListening ? "Ouvindo... fale agora" : "Digite sua mensagem..."
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
          disabled={isLoading}
        />
        <button
          className="chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          title="Enviar mensagem"
        >
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>

      <div className="chat-footer">
        <label className="chat-speak-toggle">
          <input
            type="checkbox"
            checked={speakReplies}
            onChange={(e) => setSpeakReplies(e.target.checked)}
          />
          🔊 Ler respostas em voz alta
        </label>
        <p className="chat-footer-text">
          💡 Pergunte sobre horários, serviços, agendamentos e muito mais!
        </p>
      </div>
    </div>
  );
};

export default ChatIA;
