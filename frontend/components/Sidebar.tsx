"use client";

import { useQuery } from "@tanstack/react-query";
import { createSession, listSessions } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export function Sidebar() {
  const sessionId = useAppStore((s) => s.sessionId);
  const setSessionId = useAppStore((s) => s.setSessionId);
  const clearImages = useAppStore((s) => s.clearImages);
  const setLastResult = useAppStore((s) => s.setLastResult);

  const { data: sessions, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
  });

  async function handleNewAnalysis() {
    const session = await createSession("New Analysis");
    setSessionId(session.id);
    clearImages();
    setLastResult(null);
    refetch();
  }

  function handleSelect(id: string) {
    setSessionId(id);
    clearImages();
    setLastResult(null);
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
          SQ
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">SatQuery AI</div>
          <div className="text-xs text-slate-500">Remote-sensing orchestrator</div>
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={handleNewAnalysis}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Analysis
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recent Chats
        </div>
        <ul className="space-y-1">
          {(sessions ?? []).map((s) => (
            <li key={s.id}>
              <button
                onClick={() => handleSelect(s.id)}
                className={`w-full truncate rounded-md px-2 py-2 text-left text-sm ${
                  s.id === sessionId ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-slate-200 p-3 text-xs text-slate-400">
        <div>Demo mode: system status shown in analysis panel.</div>
      </div>
    </aside>
  );
}
