"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Search,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Ellipsis,
} from "lucide-react";

type FsNode = {
  type: "file" | "folder";
  name: string;
  id: string;
  children?: FsNode[];
};

export function CodeExplorer({
  files,
  selected,
  setSelected,
}: {
  files: Record<string, string>;
  selected: string;
  setSelected: (p: string) => void;
}) {
  const tree = useMemo(() => {
    const root: FsNode = { type: "folder", name: "", id: "", children: [] };
    const ensureFolder = (parent: FsNode, name: string, id: string) => {
      const existing = parent.children!.find(
        (c) => c.type === "folder" && c.id === id
      ) as FsNode | undefined;
      if (existing) return existing;
      const folder: FsNode = { type: "folder", name, id, children: [] };
      parent.children!.push(folder);
      return folder;
    };
    const addFile = (parent: FsNode, name: string, id: string) => {
      parent.children!.push({ type: "file", name, id });
    };
    for (const path of Object.keys(files)) {
      const parts = path.split("/").filter(Boolean);
      let cur = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        if (isLast) addFile(cur, part, path);
        else cur = ensureFolder(cur, part, parts.slice(0, i + 1).join("/"));
      }
    }
    return root.children || [];
  }, [files]);

  const code = files[selected] ?? "";
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    new Set(
      Object.keys(files)
        .map((p) => p.split("/")[0])
        .filter(Boolean)
    )
  );
  const pathParts = selected.split("/");

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full">
      <div className="w-72 border-r">
        <div className="p-3 flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-full">
            <Search className="h-4 w-4 opacity-60" />
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Search files"
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100%-56px)]">
          <FileTree
            nodes={tree}
            depth={0}
            openFolders={openFolders}
            onToggle={toggleFolder}
            onSelectFile={setSelected}
            selected={selected}
          />
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            {pathParts.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={
                    i < pathParts.length - 1
                      ? "text-muted-foreground"
                      : "font-medium"
                  }
                >
                  {p}
                </span>
                {i < pathParts.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <CodeEditor code={code} />
        </ScrollArea>
      </div>
    </div>
  );
}

function FileTree({
  nodes,
  depth,
  openFolders,
  onToggle,
  onSelectFile,
  selected,
}: {
  nodes: FsNode[];
  depth: number;
  openFolders: Set<string>;
  onToggle: (id: string) => void;
  onSelectFile: (id: string) => void;
  selected: string;
}) {
  return (
    <ul className="p-2">
      {nodes.map((n) => (
        <FileTreeRow
          key={n.id + n.name + depth}
          node={n}
          depth={depth}
          openFolders={openFolders}
          onToggle={onToggle}
          onSelectFile={onSelectFile}
          selected={selected}
        />
      ))}
    </ul>
  );
}

function FileTreeRow({
  node,
  depth,
  openFolders,
  onToggle,
  onSelectFile,
  selected,
}: {
  node: FsNode;
  depth: number;
  openFolders: Set<string>;
  onToggle: (id: string) => void;
  onSelectFile: (id: string) => void;
  selected: string;
}) {
  const isFolder = node.type === "folder";
  const open = isFolder && openFolders.has(node.id);
  const isActive = selected === node.id;
  return (
    <li>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded-md ${
          isActive ? "bg-muted" : "hover:bg-muted/60"
        }`}
        style={{ paddingLeft: depth * 12 }}
        onClick={() => {
          if (isFolder) onToggle(node.id);
          else onSelectFile(node.id);
        }}
      >
        {isFolder ? (
          open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isFolder ? <Folder className="h-4 w-4" /> : null}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && open && node.children && node.children.length > 0 ? (
        <FileTree
          nodes={node.children}
          depth={depth + 1}
          openFolders={openFolders}
          onToggle={onToggle}
          onSelectFile={onSelectFile}
          selected={selected}
        />
      ) : null}
    </li>
  );
}

function CodeEditor({ code }: { code: string }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  return (
    <div className="grid grid-cols-[56px_1fr] text-sm font-mono leading-6">
      <div className="select-none bg-muted/30 border-r text-muted-foreground px-2">
        {lines.map((_, i) => (
          <div key={i} className="text-right tabular-nums">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <pre className="px-4 py-3 whitespace-pre min-w-max inline-block">
          {code}
        </pre>
      </div>
    </div>
  );
}
