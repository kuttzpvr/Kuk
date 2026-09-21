import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { shopifyService } from '../../services/shopifyService';
import { Product } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedProducts?: Product[];
}

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, selectedProduct, products, openProductDetail } = useShop();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste! I'm your KUKAPI Personal Stylist & Fit Advisor. Ask me anything about our 240 GSM heavy street tees, Chanderi festive kurtis, sizing recommendations, or outfit pairing ideas.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What size 240 GSM tee for 5'10\" & 72kg?",
    'What should I pair with the Cargo Joggers?',
    'Explain the fabric of the Festive Kurti',
    'Curate a complete outfit under ₹2500',
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isAiModalOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build history
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await shopifyService.askAiAssistant(
        text,
        history,
        selectedProduct?.id
      );

      // Collect suggested products
      const matchedProducts: Product[] = res.recommendedProducts && res.recommendedProducts.length > 0
        ? res.recommendedProducts
        : (res.suggestedProductIds || [])
            .map((id: string) => products.find((p) => p.id === id || p.handle === id))
            .filter(Boolean) as Product[];

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.text || res.reply || 'Here is what I recommend for your style.',
        suggestedProducts: matchedProducts,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I'm having trouble connecting to the styling engine right now. Here's a quick tip: for our 240 GSM Oversized T-Shirt, size M fits heights 5'8\"-5'11\" with a relaxed streetwear drape.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Namaste! I'm your KUKAPI Personal Stylist & Fit Advisor. Ask me anything about our 240 GSM heavy street tees, Chanderi festive kurtis, sizing recommendations, or outfit pairing ideas.",
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col h-[90vh] max-h-[680px] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 fill-zinc-950" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white tracking-wide">
                KUKAPI AI Stylist & Fit Guide
              </h3>
              <span className="text-[10px] text-zinc-400 block font-medium">
                Powered by Gemini 2.5 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            AI size predictions are advisory. Please cross-reference our official measurements table for perfect fit.
          </span>
        </div>

        {/* Chat History Messages */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs bg-zinc-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-zinc-950 text-white rounded-br-xs'
                    : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Suggested Product Cards in Chat */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Recommended Pieces:
                    </span>
                    {msg.suggestedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          openProductDetail(p);
                          setIsAiModalOpen(false);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="w-9 h-11 object-cover rounded-lg bg-zinc-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-900 text-[11px] line-clamp-1">
                            {p.title}
                          </h4>
                          <span className="text-[10px] font-black text-zinc-950">
                            ₹{p.price}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-800 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-zinc-300 text-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs text-zinc-500">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-zinc-200/80 p-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp)}
              className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-zinc-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about 240 GSM sizing, outfits, fabrics..."
              className="flex-1 bg-zinc-100 border border-zinc-200 rounded-full px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-zinc-950 text-white flex items-center justify-center hover:bg-zinc-800 transition-transform active:scale-95 disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
