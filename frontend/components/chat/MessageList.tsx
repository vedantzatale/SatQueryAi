"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { AssistantMessage } from "./AssistantMessage";
import { TypingIndicatorChat } from "./TypingIndicatorChat";
import { useAppStore } from "@/lib/store";
import type { Attachment, ChatMessage, ExecutionResult, Message } from "@/lib/types";

export interface MessageWithMeta extends Partial<Message> {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  timestamp?: string;
  execution_id?: string | null;
  result?: ExecutionResult | null;
  attachments?: Attachment[] | any[];
}

interface MessageListProps {
  messages: MessageWithMeta[];
  isLoading: boolean;
  loadingStatus?: string | null;
  onSelectPrompt?: (prompt: string, attachments?: Attachment[]) => void;
}

export function MessageList({ messages, isLoading, loadingStatus }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isTemporaryChat = useAppStore((s) => s.isTemporaryChat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto w-full chat-scroll-container no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent">
      <style>{`
        .chat-scroll-container::-webkit-scrollbar,
        .chat-scroll-container *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chat-scroll-container::-webkit-scrollbar-thumb,
        .chat-scroll-container *::-webkit-scrollbar-thumb {
          background: transparent !important;
          display: none !important;
        }
      `}</style>
      <div className="px-4 sm:px-8 py-6 space-y-8 max-w-3xl mx-auto w-full">
        {/* Temporary Chat Notice Banner */}
        {isTemporaryChat && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] text-xs text-[#a3a3a3] select-none">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong className="text-white font-medium">Temporary Chat:</strong> This conversation won&apos;t appear in your history, won&apos;t be saved, and will be discarded when closed.
            </span>
          </div>
        )}

      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Attached Images Chips */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2 mb-1">
                  {msg.attachments.map((att: any, aIdx: number) => (
                    <div
                      key={att.id || aIdx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#171717] border border-[#2e2e2e] shadow-subtle max-w-[280px]"
                    >
                      {att.url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0d0d0d] border border-[#333333] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center text-[10px] font-mono text-neutral-400 shrink-0">
                          TIFF
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="text-xs font-medium text-white truncate">{att.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#888888] font-mono">
                          {att.sensor && <span>{att.sensor}</span>}
                          {att.resolution && <span>• {att.resolution}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-[#212121] border border-[#2e2e2e] px-4 py-3 text-[14.5px] sm:text-[15px] leading-relaxed text-[#ececec] shadow-subtle whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          );
        }

        return (
          <AssistantMessage
            key={msg.id}
            message={msg as Message}
            content={msg.content}
            result={msg.result}
          />
        );
      })}

      {/* Loading / Streaming State */}
      {isLoading && (
        <div className="flex flex-col items-start gap-2 max-w-3xl w-full animate-in fade-in duration-150">
          <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-[#737373]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{loadingStatus ?? "SatQuery Agent • Synthesizing EO inferences..."}</span>
          </div>
          <TypingIndicatorChat type="bounce" align="left" color="#ffffff" />
        </div>
      )}

      {/* Temporary Notice at bottom if messages exist */}
      {isTemporaryChat && messages.length > 0 && (
        <div className="text-center py-2 text-[11px] text-[#737373] font-mono select-none border-t border-[#1a1a1a] mt-4">
          This chat is temporary and won&apos;t be saved to your history.
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
