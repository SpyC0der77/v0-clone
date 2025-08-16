import { NextRequest, NextResponse } from "next/server";
import { v0 } from "v0-sdk";

function pickAssistant(resp: any) {
  const msgs = resp?.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role === "assistant") {
      return msgs[i]?.content || msgs[i]?.text || "";
    }
  }
  return resp?.latestMessage?.content || "";
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, system, responseMode } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let chat: any;
    if (chatId) {
      chat = await v0.chats.sendMessage({
        chatId,
        message,
        system,
        responseMode: responseMode || "sync",
      });
    } else {
      chat = await v0.chats.create({
        message,
        system,
        responseMode: responseMode || "sync",
      });
    }

    const files = (chat?.latestVersion?.files || []).map((f: any) => ({
      path: f.name,
      content: f.content,
    }));
    const demo = chat?.latestVersion?.demoUrl || chat?.demo || null;
    const assistant = pickAssistant(chat) || "";

    return NextResponse.json({ id: chat.id, demo, assistant, files });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
