'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<unknown>;
  sending: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, sending, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending || disabled) return;

    setSendError(null);
    try {
      await onSendMessage(trimmed);
      setContent('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setSendError(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      {sendError && (
        <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900 flex items-center justify-between">
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)} className="text-red-500 hover:text-red-700 ml-2 font-bold">×</button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
        <textarea
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for newline)"
          disabled={sending || disabled}
          className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm resize-none max-h-32 px-1 py-0.5 leading-normal transition-all"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center self-center"
          title="Send message"
        >
          {sending ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
