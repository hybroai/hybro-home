"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type FormEvent,
  type ReactNode,
} from "react";
import { TextStreamChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";

// Render markdown links and bold as React elements (no dangerouslySetInnerHTML)
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          className="nextra-chat-link"
        >
          {linkMatch[1]}
        </a>
      );
    }
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return <strong key={i}>{boldMatch[1]}</strong>;
    }
    return part;
  });
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="nextra-chat-list">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, i) => {
    if (line.startsWith("- ")) {
      listItems.push(
        <li key={i}>{renderInlineMarkdown(line.slice(2))}</li>
      );
    } else {
      flushList();
      if (line.trim() === "") return;
      elements.push(
        <p key={i} className="nextra-chat-paragraph">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });
  flushList();

  return <>{elements}</>;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="nextra-chat-fab"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask the docs
      </button>
    );
  }

  return (
    <div className="nextra-chat-panel">
      {/* Header */}
      <div className="nextra-chat-header">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.875rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static raster mark */}
          <img src="/logo-mark.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
          Ask the docs
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="nextra-chat-close"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="nextra-chat-messages">
        {messages.length === 0 && (
          <div className="nextra-chat-empty">
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              Hi! I&apos;m the Hybro docs assistant.
            </p>
            <p>
              Ask me anything about Hybro, the SDK, Hub, or A2A Adapter.
            </p>
          </div>
        )}
        {messages.map((message) => {
          const text =
            message.parts
              ?.filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("") || "";

          return (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "nextra-chat-bubble nextra-chat-bubble-user"
                  : "nextra-chat-bubble nextra-chat-bubble-assistant"
              }
            >
              {message.role === "assistant" ? (
                <MarkdownContent text={text} />
              ) : (
                text
              )}
            </div>
          );
        })}
        {isLoading &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="nextra-chat-bubble nextra-chat-bubble-assistant nextra-chat-loading">
              <span className="nextra-chat-dot" />
              <span className="nextra-chat-dot" />
              <span className="nextra-chat-dot" />
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="nextra-chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Hybro docs..."
          className="nextra-chat-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="nextra-chat-send"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
