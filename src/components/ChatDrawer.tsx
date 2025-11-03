import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCheck, Loader2, Send, Wifi, WifiOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { cn } from "./ui/utils";
import { Item } from "./ItemCard";

type ChatParticipant = {
  name: string;
  avatar?: string;
};

type ChatMessage = {
  id: string;
  sender: "buyer" | "seller" | "system";
  content: string;
  timestamp: number;
  status: "pending" | "delivered";
};

type ConnectionState = "idle" | "connecting" | "open" | "error";

// ✅ Use localhost WS when running locally
const WEBSOCKET_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "ws://localhost:3001"
    : "wss://echo.websocket.events";

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

interface ChatDrawerProps {
  item: Item | null;
  buyer: ChatParticipant;
  onClose: () => void;
}

export function ChatDrawer({ item, buyer, onClose }: ChatDrawerProps) {
  const open = Boolean(item);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const buyerFirstName = buyer.name.trim().split(" ")[0] || "there";
  const itemTitle = item?.title ?? "this item";

  // Reset when drawer closes
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputValue("");
      setConnectionState("idle");
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  // Initial welcome message
  useEffect(() => {
    if (!open || !item) return;
    setMessages([
      {
        id: createMessageId(),
        sender: "seller",
        content: `Hi ${buyerFirstName}! This is ${item.seller.name}. Thanks for your interest in "${item.title}".`,
        timestamp: Date.now(),
        status: "delivered",
      },
    ]);
  }, [open, item?.id, item?.seller.name, item?.title, buyerFirstName]);

  // WebSocket setup
  useEffect(() => {
    if (!open || !item) return;

    setConnectionState("connecting");
    let isActive = true;
    const socket = new WebSocket(WEBSOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isActive) return;
      setConnectionState("open");
    };

    socket.onerror = () => {
      if (!isActive) return;
      setConnectionState("error");
    };

    socket.onclose = () => {
      if (!isActive) return;
      setConnectionState((prev) => (prev === "error" ? "error" : "idle"));
    };

    socket.onmessage = (event) => {
      if (!isActive) return;
      if (typeof event.data !== "string") return;
      if (event.data === "echo.websocket.events sponsored by Lob.com") return;

      try {
        const parsed = JSON.parse(event.data) as Partial<ChatMessage> & {
          id?: string;
        };
        if (parsed?.id) {
          // update delivery
          setMessages((prev) =>
            prev.map((m) =>
              m.id === parsed.id ? { ...m, status: "delivered" } : m
            )
          );

          // seller reply after short delay
          setTimeout(() => {
            if (!isActive) return;
            setMessages((prev) => [
              ...prev,
              {
                id: `${parsed.id}-reply`,
                sender: "seller",
                content: `Thanks for the message, ${buyerFirstName}! Let me know if you have any questions about "${itemTitle}".`,
                timestamp: Date.now(),
                status: "delivered",
              },
            ]);
          }, 700);
          return;
        }
      } catch (error) {
        console.warn("Unable to parse websocket payload", error);
      }

      if (event.data.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            sender: "system",
            content: event.data,
            timestamp: Date.now(),
            status: "delivered",
          },
        ]);
      }
    };

    return () => {
      isActive = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnectionState("idle");
    };
  }, [open, item?.id, itemTitle, buyerFirstName, connectionAttempt]);

  // Auto-scroll
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open, message not sent.");
      return;
    }

    const messageId = createMessageId();
    const outgoing: ChatMessage = {
      id: messageId,
      sender: "buyer",
      content: trimmed,
      timestamp: Date.now(),
      status: "pending",
    };

    setMessages((prev) => [...prev, outgoing]);

    try {
      socket.send(
        JSON.stringify({
          ...outgoing,
          buyerName: buyer.name,
          itemId: item.id,
        })
      );
    } catch (error) {
      console.error("Failed to send chat message", error);
      setConnectionState("error");
    }

    setInputValue("");
  };

  const handleRetryConnection = () => {
    if (!open) return;
    setConnectionState("connecting");
    setConnectionAttempt((a) => a + 1);
  };

  const connectionHelperText = (() => {
    switch (connectionState) {
      case "open":
        return "You are connected to the seller in real time.";
      case "connecting":
        return "Connecting to live chat...";
      case "error":
        return "Connection lost. Try reconnecting.";
      default:
        return "Chat is offline.";
    }
  })();

  const canSendMessage =
    connectionState === "open" &&
    Boolean(inputValue.trim()) &&
    Boolean(item);

  const renderConnectionBadge = () => {
    switch (connectionState) {
      case "open":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border border-emerald-200"
          >
            <Wifi className="h-3.5 w-3.5" /> Connected
          </Badge>
        );
      case "connecting":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 border border-amber-200"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="secondary"
            className="bg-destructive/10 text-destructive border border-destructive/40"
          >
            <WifiOff className="h-3.5 w-3.5" /> Connection lost
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground border border-transparent"
          >
            <WifiOff className="h-3.5 w-3.5" /> Offline
          </Badge>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      {item ? (
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="text-left">
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={item.seller.avatar} alt={item.seller.name} />
                <AvatarFallback>{item.seller.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-base font-semibold">
                  Chat with {item.seller.name}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {item.title}
                </DialogDescription>
              </div>
              {renderConnectionBadge()}
            </div>
          </DialogHeader>

          <Separator className="my-2" />

          <ScrollArea className="h-72 rounded-md border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 text-sm">
              {messages.map((message) => {
                if (message.sender === "system") {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {message.content}
                      </span>
                    </div>
                  );
                }

                const isBuyer = message.sender === "buyer";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      isBuyer ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="max-w-[80%] space-y-1">
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 shadow-sm",
                          isBuyer
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border"
                        )}
                      >
                        {message.content}
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-[11px] text-muted-foreground",
                          isBuyer ? "justify-end" : "justify-start"
                        )}
                      >
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {isBuyer && (
                          <span className="flex items-center gap-1">
                            {message.status === "pending" ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Sending…
                              </>
                            ) : (
                              <>
                                <CheckCheck className="h-3 w-3" />
                                Delivered
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {connectionState === "error" && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span>We lost the connection to the chat.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetryConnection}
              >
                Retry
              </Button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Write a message..."
                disabled={connectionState !== "open"}
              />
              <Button type="submit" disabled={!canSendMessage}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {connectionHelperText}
            </p>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
