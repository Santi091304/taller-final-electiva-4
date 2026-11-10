import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ShoppingBag, 
  Calculator,
  UploadCloud,
  ChevronDown,
  Maximize2,
  Minimize2,
  Trash2,
  Mic
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: string;
  recommendedProduct?: {
    name: string;
    price: number;
    size: string;
  };
}

interface PintukoAiChatProps {
  onOpenCalculator: () => void;
  onOpenQuote: () => void;
  onSelectProductCategory: (category: string) => void;
}

export const PintukoAiChat: React.FC<PintukoAiChatProps> = ({
  onOpenCalculator,
  onOpenQuote,
  onSelectProductCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '¡Hola! 👋 Soy Sofi, tu asesora técnica de Pintuko PRO 💕\n\nPuedo ayudarte con mucho gusto a:\n• Diagnosticar problemas en tus paredes (humedad, salitre, grietas).\n• Recomendarte combinaciones y paletas de color preciosas para tu sala o fachada.\n• Calcular los galones necesarios según tus metros cuadrados.\n\n📷 ¡Adjunta una foto de tu pared o espacio para realizar un diagnóstico técnico instantáneo!',
      timestamp: 'Ahora',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Cache available voices and handle async loading in browsers (e.g., Chrome)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Función de Síntesis de Voz: Selección femenina en español y ajustes de naturalidad
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    
    // Detener cualquier locución previa
    window.speechSynthesis.cancel();

    // Limpiar caracteres de formato (markdown, viñetas, URLs) para una dicción fluida
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/•/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 2. Ajuste de Tono y Ritmo (Voz Dulce y Amable)
    utterance.pitch = 1.3; // Tono ligeramente más alto para un matiz juvenil, cálido y dulce
    utterance.rate = 0.95;  // Ritmo pausado, tranquilo y natural

    // 1. Selección de Voz Femenina en Español
    const allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const spanishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('es'));

    // Nombres prioritarios solicitados de asistente femenino en español
    const priorityFemaleNames = [
      'monica', 
      'mónica', 
      'paulina', 
      'helena', 
      'lucia', 
      'lucía', 
      'sofia', 
      'sofía', 
      'female', 
      'google español'
    ];

    // Buscar coincidencia prioritaria
    let selectedVoice = spanishVoices.find(v => {
      const voiceName = v.name.toLowerCase();
      return priorityFemaleNames.some(name => voiceName.includes(name));
    });

    // Si no encuentra una específica, usar la primera disponible en español
    if (!selectedVoice && spanishVoices.length > 0) {
      selectedVoice = spanishVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'es-ES';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleToggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate intelligent response
  const generateAiResponse = (userQuery: string, hasPhoto: boolean): { text: string; recommendedProduct?: any } => {
    const query = userQuery.toLowerCase();

    if (hasPhoto) {
      if (query.includes('humed') || query.includes('salitre') || query.includes('mancha') || query.includes('hongo')) {
        return {
          text: '🔍 He analizado la fotografía: Detecto signos de humedad por capilaridad y eflorescencia salina activa en el revoque.\n\n🛠️ Protocolo Recomendado:\n1. Raspar la superficie hasta llegar al mortero firme.\n2. Tratar con solución neutralizadora de salitre y dejar secar 48h.\n3. Aplicar Imprimante Bloqueador Pintuko y rematar con Viniltex Avanzada Antibacterial.',
          recommendedProduct: {
            name: 'Viniltex Avanzada Antibacterial',
            price: 89900,
            size: '1 Galón'
          }
        };
      }
      if (query.includes('grieta') || query.includes('fisura')) {
        return {
          text: '🔍 Análisis de la imagen completado: Se observan microfisuras vivas ocasionadas por dilatación térmica exterior.\n\n🛠️ Solución Técnica:\nSellar con masilla elastomérica Pintuko y recubrir con 2 manos de Koraza 5 Años, que tiene una elongación superior al 400% y sella fisuras de hasta 0.8 mm.',
          recommendedProduct: {
            name: 'Koraza 5 Años Fachadas',
            price: 116900,
            size: '1 Galón'
          }
        };
      }
      return {
        text: '📸 ¡Excelente fotografía recibida! He analizado la iluminación y la textura de tu espacio.\n\n🎨 Paleta de Armonía Sugerida:\n• Tono Principal: Blanco Nieve Puro (base luminosa y limpia).\n• Tono de Contraste: Azul Noche Profundo o Gris Ágata Nórdico.\n\nTe recomiendo usar Viniltex Avanzada Antibacterial con acabado mate, ideal para no reflejar imperfecciones.',
        recommendedProduct: {
          name: 'Viniltex Avanzada Antibacterial',
          price: 89900,
          size: '1 Galón'
        }
      };
    }

    if (query.includes('humed') || query.includes('salitre') || query.includes('gota') || query.includes('filtrac')) {
      return {
        text: 'Para problemas de humedad y salitre, el error más común es pintar directamente encima. Primero debes limpiar las sales con cepillo de alambre, aplicar Sellador Anti-humedad Pintuko Pro y luego pintar con Viniltex Avanzada Antibacterial en interiores o TechoShield en terrazas.',
        recommendedProduct: {
          name: 'TechoShield Fibrado 10 Años',
          price: 139900,
          size: '1 Galón'
        }
      };
    }

    if (query.includes('piso') || query.includes('epox') || query.includes('taller') || query.includes('garaje') || query.includes('bodega')) {
      return {
        text: 'Para pisos de talleres, parqueaderos o bodegas, necesitas nuestro recubrimiento Pintuko Epóxico 100% Sólidos. Resiste tráfico pesado de montacargas, derrames de gasolina, aceites y solventes con acabado autonivelante espejo.',
        recommendedProduct: {
          name: 'Pintuko Epóxico Pisos 100% Sólidos',
          price: 189900,
          size: '1 Galón'
        }
      };
    }

    if (query.includes('color') || query.includes('sala') || query.includes('habitac') || query.includes('cuarto')) {
      return {
        text: 'Para salas y áreas sociales modernas, la tendencia actual combina tonos neutros cálidos como Arena Colonial o Gris Ágata Nórdico, con una pared de acento en Azul Noche Profundo o Verde Eucalipto. En nuestro catálogo interactivo arriba puedes probar cada color en vivo sobre el bote de pintura.',
        recommendedProduct: {
          name: 'Viniltex Avanzada Antibacterial',
          price: 89900,
          size: '1 Galón'
        }
      };
    }

    if (query.includes('metal') || query.includes('reja') || query.includes('puerta') || query.includes('óxido')) {
      return {
        text: 'Para rejas, portones o tuberías metálicas expuestas a la intemperie, la mejor opción es Pintulux Esmalte 3 en 1: actúa como anticorrosivo, base y acabado brillante de secado rápido sin requerir imprimante previo.',
        recommendedProduct: {
          name: 'Pintulux Esmalte 3 en 1',
          price: 69900,
          size: '1 Galón'
        }
      };
    }

    if (query.includes('calcul') || query.includes('cuanto') || query.includes('metro') || query.includes('galon') || query.includes('m2')) {
      return {
        text: 'Como regla técnica general de Pintuko Pro: 1 Galón rinde entre 35 y 45 m² a una mano (o 20 a 25 m² a dos manos con merma). Si vas a pintar 80 m², necesitarás aproximadamente 4 galones o 1 Cuñete de 5 Galones para asegurar dos manos completas.',
      };
    }

    return {
      text: '¡Entendido! En Pintuko PRO contamos con fórmulas certificadas directas de fábrica para Vinilos Lavables, Fachadas, Esmaltes Metálicos y Epóxicos Industriales. ¿Deseas que te recomiende un producto para un área específica o prefieres cotizar con pintores certificados?',
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const userText = inputText.trim() || 'He adjuntado una fotografía para diagnóstico técnico.';
    const imgToSend = attachedImage;

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      imageUrl: imgToSend || undefined,
      timestamp: 'Ahora',
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setAttachedImage(null);
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiReply = generateAiResponse(userText, !!imgToSend);
      const newAiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply.text,
        timestamp: 'Ahora',
        recommendedProduct: aiReply.recommendedProduct,
      };

      setIsTyping(false);
      setMessages(prev => [...prev, newAiMsg]);

      // Trigger automatic speech
      if (voiceEnabled) {
        speakText(aiReply.text);
      }
    }, 1100);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => {
              setIsOpen(true);
              if (messages.length === 1 && voiceEnabled) {
                speakText(messages[0].text);
              }
            }}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-2xl shadow-blue-600/50 border border-blue-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Abrir Asistente Pintuko IA"
          >
            {/* Pulsing beacon */}
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
            </span>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black tracking-wider uppercase font-display">Pintuko IA</div>
                <div className="text-[10px] text-blue-200">Diagnóstico & Voz</div>
              </div>
            </div>

            {/* Speaking visual wave pill if active */}
            {isSpeaking && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-amber-300 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </div>
            )}
          </button>
        ) : null}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[88vh] h-[620px] bg-[#090f20] border border-blue-500/40 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-950 via-[#0d162e] to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/40">
                <Bot className="w-6 h-6 text-amber-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Sofi · Asistente Pintuko IA</h3>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">En línea</span>
                  <span>·</span>
                  <span>Voz dulce activa 💕</span>
                </div>
              </div>
            </div>

            {/* Voice and Controls Action Buttons */}
            <div className="flex items-center gap-1.5">
              
              {/* Voice Speaking Indicator & Controls */}
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold shadow-md animate-pulse cursor-pointer"
                  title="Detener voz"
                >
                  <span className="w-1 h-3 bg-slate-950 rounded-full animate-bounce"></span>
                  <span className="w-1 h-4 bg-slate-950 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1 h-2 bg-slate-950 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="text-[10px] ml-1">Callar</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    voiceEnabled 
                      ? 'text-amber-400 hover:text-white hover:bg-slate-800' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={voiceEnabled ? "Voz activada (clic para silenciar)" : "Voz desactivada (clic para activar)"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice status bar */}
          <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mic className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`} />
              <span>{isSpeaking ? 'Pintuko IA está hablando...' : (voiceEnabled ? 'Voz en español activa' : 'Voz silenciada')}</span>
            </div>
            <span className="text-[10px] text-slate-500">Subir foto para diagnóstico</span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {/* Attached user image if any */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 bg-black">
                      <img
                        src={msg.imageUrl}
                        alt="Foto adjunta para diagnóstico"
                        className="w-full max-h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Recommended Product Quick Card in AI response */}
                  {msg.recommendedProduct && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-amber-400/30 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          Producto Formulado:
                        </div>
                        <div className="text-xs font-bold text-white">
                          {msg.recommendedProduct.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ${msg.recommendedProduct.price.toLocaleString('es-CO')} COP · {msg.recommendedProduct.size}
                        </div>
                      </div>
                      <a
                        href="#catalogo"
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Ver</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Message footer with voice replay button */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-[10px] text-blue-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Escuchar respuesta con voz"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Escuchar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>Analizando consulta técnica...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              '💧 ¿Cómo quitar humedad y salitre?',
              '🎨 Colores para sala moderna',
              '🏢 Epóxico para pisos de taller',
              '📐 ¿Cuántos galones para 80 m²?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="px-2.5 py-1 rounded-full text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-amber-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Attached Image Preview Bar */}
          {attachedImage && (
            <div className="px-4 py-2 bg-blue-950/60 border-t border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={attachedImage}
                  alt="Vista previa"
                  className="w-8 h-8 rounded-lg object-cover border border-white/40"
                />
                <span className="text-xs text-slate-200 font-semibold truncate max-w-[200px]">
                  Foto lista para diagnóstico
                </span>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Quitar foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input & Upload Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0c1429] border-t border-slate-800 flex items-center gap-2"
          >
            {/* File upload button for photo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Subir foto de pared o espacio"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={attachedImage ? "Escribe un comentario sobre la foto..." : "Escribe tu consulta o sube una foto..."}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !attachedImage}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
