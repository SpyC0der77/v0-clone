"use client";

import { useState } from "react";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

type Chat = { id: string; demo?: string };
type FileUpdate = { path: string; content: string };

export function ChatPanel({
  onApplyFiles,
}: {
  onApplyFiles: (updates: FileUpdate[]) => void;
}) {
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ type: "user" | "assistant"; content: string }>
  >([]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setChatHistory((prev) => [...prev, { type: "user", content: userMessage }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, chatId: currentChat?.id }),
      });
      if (!res.ok) throw new Error("bad status");
      const data: {
        id: string;
        demo?: string;
        assistant?: string;
        files?: { path: string; content: string }[];
      } = await res.json();
      setCurrentChat({ id: data.id, demo: data.demo });
      if (data.assistant && data.assistant.trim().length) {
        setChatHistory((prev) => [
          ...prev,
          { type: "assistant", content: data.assistant as string },
        ]);
      }
      if (data.files && data.files.length) {
        onApplyFiles(data.files);
        setChatHistory((prev) => [
          ...prev,
          { type: "assistant", content: "Applied file updates." },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b p-3 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold">v0 Clone</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center font-semibold mt-8">
            <p className="text-3xl mt-4">What can we build together?</p>
          </div>
        ) : (
          <>
            <Conversation>
              <ConversationContent>
                {chatHistory.map((msg, index) => (
                  <Message from={msg.type} key={index}>
                    <MessageContent>{msg.content}</MessageContent>
                  </Message>
                ))}
              </ConversationContent>
            </Conversation>
            {isLoading && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-2">
                    <Loader />
                    Creating your app...
                  </div>
                </MessageContent>
              </Message>
            )}
          </>
        )}
      </div>
      <div className="border-t p-4">
        {!currentChat && (
          <Suggestions>
            <Suggestion
              onClick={() =>
                setMessage("Create a responsive navbar with Tailwind CSS")
              }
              suggestion="Create a responsive navbar with Tailwind CSS"
            />
            <Suggestion
              onClick={() => setMessage("Build a todo app with React")}
              suggestion="Build a todo app with React"
            />
            <Suggestion
              onClick={() =>
                setMessage("Make a landing page for a coffee shop")
              }
              suggestion="Make a landing page for a coffee shop"
            />
          </Suggestions>
        )}
        <div className="flex gap-2">
          <PromptInput
            onSubmit={handleSendMessage}
            className="mt-4 w-full max-w-2xl mx-auto relative"
          >
            <PromptInputTextarea
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              className="pr-12 min-h-[60px]"
            />
            <PromptInputSubmit
              className="absolute bottom-1 right-1"
              disabled={!message}
              status={isLoading ? "streaming" : "ready"}
            />
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
