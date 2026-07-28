import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  UserIcon,
  StarIcon,
  SparklesIcon,
  CreditCardIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { chatAPI } from '../../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        message: "Hello! I'm Cheffy, your personal booking assistant. I can help you find the best chefs, caterers, and decorators in Tamil Nadu. What are you looking for today?",
        is_bot: true,
        bot_name: "Cheffy"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { message: userMessage, is_bot: false }]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: userMessage,
        session_id: sessionId
      });
      
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, {
        message: response.data.message,
        is_bot: true,
        recommendations: response.data.recommendations,
        bot_name: response.data.bot_name
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        message: "Sorry, I'm having trouble connecting. Please try again.",
        is_bot: true,
        bot_name: "Cheffy"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#8B1538] to-[#B91C1C] text-white rounded-full px-6 py-4 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <span className="font-semibold">Cheffy</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B1538] to-[#B91C1C] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Cheffy</h3>
                <p className="text-xs text-white/80">Your Booking Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 min-h-64 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.is_bot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] ${msg.is_bot ? 'order-1' : 'order-2'}`}>
                  {msg.is_bot && (
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">Cheffy</span>
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    msg.is_bot 
                      ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none' 
                      : 'bg-[#8B1538] text-white rounded-tr-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{formatMessage(msg.message)}</p>
                  </div>
                  
                  {/* Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.recommendations.slice(0, 3).map((rec, i) => (
                        <Link
                          key={i}
                          to={`/services/${rec.id}`}
                          onClick={() => setIsOpen(false)}
                          className="block bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-[#F59E0B] hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{rec.title}</p>
                              <p className="text-xs text-gray-500">{rec.provider_name}</p>
                            </div>
                            <div className="text-right flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                              <span className="text-sm font-bold text-[#F59E0B]">{rec.rating}</span>
                            </div>
                          </div>
                          {rec.price_per_event && (
                            <p className="text-xs text-gray-600 mt-1">Rs.{rec.price_per_event?.toLocaleString()} per event</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="px-4 py-3 bg-[#8B1538] text-white rounded-xl hover:bg-[#A31B47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setInputValue("I need a chef for wedding")}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 whitespace-nowrap flex items-center gap-1"
              >
                <SparklesIcon className="w-3 h-3" />
                Wedding Chef
              </button>
              <button
                type="button"
                onClick={() => setInputValue("Best caterers in Chennai")}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 whitespace-nowrap"
              >
                Caterers
              </button>
              <button
                type="button"
                onClick={() => setInputValue("How do I make payment?")}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 whitespace-nowrap flex items-center gap-1"
              >
                <CreditCardIcon className="w-3 h-3" />
                Payment Help
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
