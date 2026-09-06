"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AssistantMessage } from "./AssistantMessage";
import type { ChatMessage, ExecutionResult } from "@/lib/types";

export interface MessageWithMeta extends ChatMessage {
  result?: ExecutionResult | null;
  attachments?: { name: string; type: string }[];
}

interface MessageListProps {
  messages: MessageWithMeta[];
  isLoading: boolean;
  loadingStatus?: string | null;
}

export function MessageList({ messages, isLoading, loadingStatus }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex flex-col items-end gap-2 animate-fade-in">
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-neutral-400">
                    <span>ATTACHED:</span>
                    {msg.attachments.map((att, aIdx) => (
                      <span
                        key={aIdx}
                        className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-neutral-300"
                      >
                        {att.name} ({att.type})
                      </span>
                    ))}
                  </div>
                )}
                <div className="max-w-xl rounded-[24px] bg-[#212121] px-5 py-3 text-[15.5px] leading-relaxed text-[#ececec]">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <AssistantMessage
              key={msg.id}
              content={msg.content}
              result={msg.result}
            />
          );
        })}

        {/* Loading / Pipeline Ingestion State */}
        {isLoading && (
          <div className="flex flex-col items-start gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Image
                src="/logo/satquertlogo.png"
                alt="SatQuery AI"
                width={20}
                height={20}
                className="h-5 w-5 rounded-[4px] object-contain shrink-0"
              />
              <span className="font-medium text-white">SatQuery AI</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 flex items-center gap-3 font-mono text-xs text-neutral-300">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>{loadingStatus ?? "Orchestrating Earth observation analysis…"}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
