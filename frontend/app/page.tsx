import { ChatPanel } from "@/components/ChatPanel";
import { EvidencePanel } from "@/components/EvidencePanel";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <ChatPanel />
      <EvidencePanel />
    </main>
  );
}
