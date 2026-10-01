'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, RefreshCw } from 'lucide-react';
import { TripSnapshot, ModificationResult } from '@/types/trip';

interface AIAssistantChatProps {
  trip: TripSnapshot;
  isOpen: boolean;
  onClose: () => void;
  onTripUpdated: (updatedTrip: TripSnapshot, changeResult?: ModificationResult['appliedChanges']) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  appliedChanges?: any;
}

export default function AIAssistantChat({
  trip,
  isOpen,
  onClose,
  onTripUpdated
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your dedicated travel concierge for ${trip.destination}. Ask me to modify any part, swap hotels, soften the pace, or ask questions like "What should I pack?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Make Day 2 less tiring',
    'Remove the houseboat and add Munnar',
    'Reduce budget to ₹45,000',
    'We want one luxury hotel night',
    'Which day has the most walking?',
    'What should I pack for this trip?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const isModificationIntent =
      question.toLowerCase().includes('make') ||
      question.toLowerCase().includes('remove') ||
      question.toLowerCase().includes('delete') ||
      question.toLowerCase().includes('add') ||
      question.toLowerCase().includes('reduce') ||
      question.toLowerCase().includes('upgrade') ||
      question.toLowerCase().includes('cheaper') ||
      question.toLowerCase().includes('change') ||
      question.toLowerCase().includes('temple');

    try {
      if (isModificationIntent) {
        const res = await fetch(`/api/trips/${trip.id}/modify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction: question })
        });
        const data = await res.json();

        if (data.trip) {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.explanation || 'I have recalculated the itinerary and updated your schedule.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            appliedChanges: data.appliedChanges
          };
          setMessages(prev => [...prev, aiMsg]);
          onTripUpdated(data.trip, data.appliedChanges);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.error || 'Failed to modify itinerary. Please try another instruction.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId: trip.id, question })
        });
        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'I am ready to help with any route, timing, or packing queries.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an issue connecting to the planning service. Please retry in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
      
      {/* Chat Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold border border-brand-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-sm">Voyage Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Dependency Recalculation Active</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafbfc]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-200">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="max-w-[85%] space-y-1">
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {msg.appliedChanges && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] space-y-1 bg-emerald-50/70 p-2 rounded-xl text-emerald-900">
                    <span className="font-extrabold uppercase text-[9px] tracking-wider text-emerald-800">Changes Applied:</span>
                    {msg.appliedChanges.added?.length > 0 && (
                      <div className="text-emerald-700 font-bold">Added: {msg.appliedChanges.added.join(', ')}</div>
                    )}
                    {msg.appliedChanges.removed?.length > 0 && (
                      <div className="text-rose-700 font-bold">Removed: {msg.appliedChanges.removed.join(', ')}</div>
                    )}
                    <div className="text-slate-600 flex items-center justify-between text-[10px] pt-1">
                      <span>Budget: {trip.budget.currency} {msg.appliedChanges.budgetBefore?.toLocaleString()} → {trip.budget.currency} {msg.appliedChanges.budgetAfter?.toLocaleString()}</span>
                      {msg.appliedChanges.walkingAfterKm && (
                        <span>Walk: {msg.appliedChanges.walkingAfterKm} km</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-400 px-1">{msg.timestamp}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center text-xs text-brand-600 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Recalculating dependencies...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-[10px] text-slate-700 font-semibold whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI or request an edit (e.g. 'Make Day 2 relaxed')..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
