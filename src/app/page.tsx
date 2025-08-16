"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatPanel } from "@/components/chat-panel";
import { CodeExplorer } from "@/components/code-explorer";
import { initialFiles, FileUpdate } from "@/lib/initial-files";

export default function Page() {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [selected, setSelected] = useState<string>("lib/constants.ts");

  const applyUpdates = (updates: FileUpdate[]) => {
    if (!updates || updates.length === 0) return;
    const next: Record<string, string> = { ...files };
    for (const u of updates) next[u.path] = u.content;
    setFiles(next);
    setSelected(updates[0].path);
  };

  return (
    <div className="min-h-screen w-full bg-background p-8">
      <div className="grid grid-cols-4 gap-8 h-[calc(100vh-4rem)] min-h-0">
        <Card className="col-span-1 rounded-2xl shadow-sm shadow-black/10 border bg-card min-h-0 overflow-hidden">
          <CardContent className="h-full p-0 min-h-0 overflow-hidden">
            <ChatPanel onApplyFiles={applyUpdates} />
          </CardContent>
        </Card>
        <Card className="col-span-3 rounded-2xl shadow-sm shadow-black/10 border bg-card min-h-0 overflow-hidden">
          <CardContent className="h-full p-0 min-h-0 overflow-hidden">
            <CodeExplorer
              files={files}
              selected={selected}
              setSelected={setSelected}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
