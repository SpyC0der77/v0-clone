// lib/initial-files.ts
export type FileUpdate = { path: string; content: string };

export const initialFiles: Record<string, string> = {
  "layout.tsx": [
    "export default function RootLayout({ children }: { children: React.ReactNode }) {",
    "  return (",
    "    <html lang='en'>",
    "      <body>{children}</body>",
    "    </html>",
    "  )",
    "}",
  ].join("\n"),
  "page.tsx": [
    "export default function Page() {",
    "  return <div>Hello</div>",
    "}",
  ].join("\n"),
  "globals.css": [":root{color-scheme:dark light}", "body{margin:0}"].join(
    "\n"
  ),
  "lib/constants.ts": "export const SITE_NAME = 'Example'\n",
};
