
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import SeverityBadge from './SeverityBadge.jsx';

const DISPATCHER_ROLES = ['eoc', 'admin', 'rescue_team'];

const CITIZEN_SUGGESTIONS = [
  'Water is entering my house',
  'I smell smoke nearby',
  'Someone is injured',
];

const EOC_SUGGESTIONS = [
  'Show all unverified flood reports',
  'Critical incidents that are active',
  'Show resolved reports',
];

export default function AssistantChat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDispatcher = DISPATCHER_ROLES.includes(user?.role);
  const isCitizen = user?.role?.toLowerCase() === 'citizen';

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: isDispatcher
        ? 'Ask me to filter incidents, e.g. "show all unverified flood reports."'
        : "I'm the ResQNet safety assistant. Tell me what's happening and I'll help — or use the SOS button for immediate danger.",
    },
  ]);
  const [coords, setCoords] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isDispatcher || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        }),
      () => setCoords(null),
      { timeout: 5000 }
    );
  }, [isDispatcher]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, open]);

  const sendMessage = useMutation({
    mutationFn: async (text) =>
      (
        await api.post('/ai/chat', {
          message: text,
          ...(coords || {}),
        })
      ).data,

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'assistant',
          text: data.reply,
          incidents: data.incidents,
        },
      ]);
    },

    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'assistant',
          text: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    },
  });

  const handleSend = (text) => {
    const trimmed = (text ?? input).trim();

    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: trimmed },
    ]);

    setInput('');
    sendMessage.mutate(trimmed);
  };

  const suggestions = isDispatcher
    ? EOC_SUGGESTIONS
    : CITIZEN_SUGGESTIONS;

  const panelStyle = isCitizen
    ? 'border-[#c9c9c6] bg-[#f0f0ed] shadow-[0_18px_55px_rgba(0,0,0,0.16)]'
    : 'border-console-border bg-console-surface shadow-2xl';

  const headerStyle = isCitizen
    ? 'border-[#c9c9c6] bg-[#dededb]'
    : 'border-console-border bg-console-surfaceAlt';

  const titleStyle = isCitizen
    ? 'text-[#242424]'
    : 'text-console-mist';

  const assistantMessageStyle = isCitizen
    ? 'border border-[#d0d0cc] bg-[#e5e5e1] text-[#292929]'
    : 'border border-console-border bg-console-bg text-console-mist';

  const userMessageStyle = isCitizen
    ? 'bg-[#292929] text-[#f4f4f2]'
    : 'bg-brand text-white';

  const footerStyle = isCitizen
    ? 'border-[#c9c9c6] bg-[#e9e9e7]'
    : 'border-console-border';

  const inputStyle = isCitizen
    ? 'border-[#c9c9c6] bg-[#f4f4f2] text-[#222222] placeholder:text-[#777773] focus:border-[#555550]'
    : 'border-console-border bg-console-bg text-console-mist focus:border-brand';

  const sendButtonStyle = isCitizen
    ? 'bg-[#292929] text-white hover:bg-[#444440]'
    : 'bg-brand text-white hover:bg-brand-dark';

  const floatingButtonStyle = isCitizen
    ? 'bg-[#292929] text-[#f4f4f2] hover:bg-[#444440]'
    : 'bg-brand text-white hover:bg-brand-dark';

  return (
    <div className="fixed bottom-5 right-5 z-50 font-body">

      {open && (
        <div
          className={`mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl border ${panelStyle}`}
        >
          {/* Chat header */}
          <div
            className={`flex items-center justify-between border-b px-4 py-3 ${headerStyle}`}
          >
            <div>
              <p
                className={`font-display text-sm font-semibold ${titleStyle}`}
              >
                {isDispatcher
                  ? 'EOC Assistant'
                  : 'ResQNet Assistant'}
              </p>

              {isCitizen && (
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-[#777773]">
                  Your safety companion
                </p>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className={
                isCitizen
                  ? 'rounded-md px-2 py-1 text-[#666660] transition hover:bg-[#d2d2ce] hover:text-[#222222]'
                  : 'text-console-muted hover:text-console-mist'
              }
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className={`flex-1 space-y-3 overflow-y-auto p-3 ${
              isCitizen ? 'bg-[#e9e9e7]' : ''
            }`}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.from === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.from === 'user'
                      ? userMessageStyle
                      : assistantMessageStyle
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* EOC incident search results */}
                  {m.incidents?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {m.incidents.map((inc) => (
                        <button
                          key={inc._id}
                          onClick={() => navigate('/eoc')}
                          className={`flex w-full items-center justify-between gap-2 rounded border px-2 py-1.5 text-left transition ${
                            isCitizen
                              ? 'border-[#c9c9c6] bg-[#f0f0ed] text-[#292929] hover:border-[#777773]'
                              : 'border-console-border hover:border-brand'
                          }`}
                        >
                          <span className="truncate">
                            {inc.title}
                          </span>

                          <SeverityBadge
                            severity={inc.severity}
                            pulse={false}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sendMessage.isPending && (
              <p
                className={`font-mono text-[10px] ${
                  isCitizen
                    ? 'text-[#777773]'
                    : 'text-console-muted'
                }`}
              >
                Thinking…
              </p>
            )}
          </div>

          {/* Suggestions and input */}
          <div className={`border-t p-3 ${footerStyle}`}>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className={`rounded-lg border px-2 py-1 text-[10px] transition ${
                    isCitizen
                      ? 'border-[#c9c9c6] bg-[#f0f0ed] text-[#555550] hover:border-[#777773] hover:bg-[#dededb] hover:text-[#222222]'
                      : 'border-console-border text-console-muted hover:border-brand hover:text-brand'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isDispatcher
                    ? 'Ask about incidents…'
                    : "What's happening?"
                }
                className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition ${inputStyle}`}
              />

              <button
                type="submit"
                disabled={sendMessage.isPending}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${sendButtonStyle}`}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition ${floatingButtonStyle}`}
        aria-label="Open assistant chat"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
