"use client";

import { tenderQueryTool } from "@/ai/flows/tender-query-tool";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CornerDownLeft, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";
import { QuerySuggestions } from "./query-suggestions";
import { Icons } from "../icons";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";

type Message = {
  id: string;
  content: React.ReactNode;
  role: "user" | "assistant";
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.slice(-1) === "@") {
      setShowSuggestions(true);
    } else {
      if(showSuggestions) setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput((prev) => prev.slice(0, -1) + `@${suggestion} `);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const highlightTags = (text: string) => {
    const parts = text.split(/(@[a-zA-Z]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        let colorClass = 'text-accent';
        if (part.toLowerCase().includes('budget')) colorClass = 'text-green-500';
        if (part.toLowerCase().includes('location')) colorClass = 'text-orange-500';
        return <strong key={index} className={cn('font-semibold', colorClass)}>{part}</strong>;
      }
      return part;
    });
  };

  const submitQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setInput("");
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: <p>{highlightTags(query)}</p>,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
      role: "assistant",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const result = await tenderQueryTool({ query });
      const assistantMessage: Message = {
        id: loadingMessage.id,
        content: <p>{result.tenderInfo}</p>,
        role: "assistant",
      };
      setMessages((prev) => prev.map(m => m.id === loadingMessage.id ? assistantMessage : m));
    } catch (error) {
      console.error("Error querying tender info:", error);
      const errorMessage: Message = {
        id: loadingMessage.id,
        content: <p className="text-destructive">Sorry, something went wrong. Please try again.</p>,
        role: "assistant",
      };
       setMessages((prev) => prev.map(m => m.id === loadingMessage.id ? errorMessage : m));
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitQuery(input);
  };
  
  const handleSuggestionQuery = (query: string) => {
    setInput(query);
    submitQuery(query);
  }

  return (
    <div className="relative flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 pr-6 sm:p-6 sm:pr-8 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
              <Icons.logo className="h-16 w-16 mb-4 text-primary/30" />
              <h2 className="text-2xl font-semibold text-foreground">Welcome to TenderAI</h2>
              <p>Start by asking a question below or try a suggestion.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-start gap-4", message.role === "user" ? "justify-end" : "")}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border">
                   <div className="flex h-full w-full items-center justify-center bg-background">
                    <Icons.logo className="h-5 w-5 text-primary"/>
                   </div>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[75%] rounded-lg p-3 text-sm shadow-sm",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
              )}>
                {message.content}
              </div>
              {message.role === "user" && (
                 <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && <QuerySuggestions onSelectQuery={handleSuggestionQuery} />}
          
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-lg border focus-within:ring-1 focus-within:ring-ring">
                <PopoverAnchor asChild>
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about tenders... Type @ for tags."
                    className="min-h-12 resize-none border-0 p-3 pr-12 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    disabled={isLoading}
                  />
                </PopoverAnchor>
              <div className="absolute right-2 top-3 flex items-center gap-2">
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <CornerDownLeft className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>

            <PopoverContent className="w-48 p-1" align="start" side="top">
                <Button variant="ghost" className="w-full justify-start text-sm p-2" onClick={() => handleSuggestionClick("Tender")}>Tender</Button>
                <Button variant="ghost" className="w-full justify-start text-sm p-2" onClick={() => handleSuggestionClick("Budget")}>Budget</Button>
                <Button variant="ghost" className="w-full justify-start text-sm p-2" onClick={() => handleSuggestionClick("Location")}>Location</Button>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </div>
  );
}
