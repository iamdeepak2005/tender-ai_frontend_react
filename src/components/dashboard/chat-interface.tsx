"use client";

import { tenderQueryTool } from "@/ai/flows/tender-query-tool";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CornerDownLeft, Loader2, Mic, MicOff, Paperclip, Camera as CameraIcon, ImageUp, X, Wrench, FileText, Info, HelpCircle, Globe } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { QuerySuggestions } from "./query-suggestions";
import { Icons } from "../icons";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CameraDialog } from "./camera-dialog";


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

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);


  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setAttachment(dataUri);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleCameraCapture = (dataUri: string) => {
    setAttachment(dataUri);
    setIsCameraOpen(false);
  };

  const submitQuery = async (query: string, image?: string | null) => {
    if ((!query.trim() && !image) || isLoading) return;

    setIsLoading(true);
    setInput("");
    setAttachment(null);
    
    const userMessageContent = (
      <>
        {image && (
          <Image
            src={image}
            alt="Attachment"
            width={200}
            height={200}
            className="rounded-md mb-2 object-cover max-w-full h-auto"
          />
        )}
        {query && <p>{highlightTags(query)}</p>}
      </>
    );

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
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
      const result = await tenderQueryTool({ query, imageDataUri: image || undefined });
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
    submitQuery(input, attachment);
  };
  
  const handleSuggestionQuery = (query: string) => {
    setInput(query);
    submitQuery(query, attachment);
  }

  return (
    <div className="relative flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10 sm:pt-20">
              <Icons.logo className="h-16 w-16 mb-4 text-primary/30" />
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Welcome to TenderAI</h2>
              <p>Start by asking a question or attaching a file below.</p>
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
                "break-words",
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
      
      <div className="p-2 sm:p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && <QuerySuggestions onSelectQuery={handleSuggestionQuery} />}
          
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx" />
          <CameraDialog open={isCameraOpen} onOpenChange={setIsCameraOpen} onCapture={handleCameraCapture} />

          {attachment && (
            <div className="relative w-fit mb-2 p-2 border rounded-md bg-muted">
              <Image src={attachment} alt="Attachment preview" width={80} height={80} className="rounded-md object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setAttachment(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <form onSubmit={handleSubmit} className="relative">
              <div className="overflow-hidden rounded-lg border focus-within:ring-1 focus-within:ring-ring">
                  <PopoverAnchor asChild>
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder={isListening ? "Listening..." : "Ask about tenders... Type @ for tags."}
                      className="min-h-12 resize-none border-0 p-3 pl-24 pr-24 shadow-none focus-visible:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }
                      }}
                      disabled={isLoading || isListening}
                    />
                  </PopoverAnchor>
                
                <div className="absolute left-1.5 top-2.5 flex items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" size="icon" variant="ghost">
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Attach a file</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 mb-2" side="top" align="start">
                      <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2" onClick={() => fileInputRef.current?.click()}>
                          <ImageUp className="h-4 w-4" />
                          Upload Image/File
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2" onClick={() => setIsCameraOpen(true)}>
                          <CameraIcon className="h-4 w-4" />
                          Use Camera
                      </Button>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="ghost">
                        <Wrench className="h-4 w-4" />
                        <span className="sr-only">Tools</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 mb-2" side="top" align="start">
                        <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2">
                            <FileText className="h-4 w-4" />
                            Summary
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2">
                            <Info className="h-4 w-4" />
                            Details
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Prebid Queries
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm p-2 gap-2">
                            <Globe className="h-4 w-4" />
                            Search the Web
                        </Button>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="absolute right-2 top-2.5 flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? 'destructive' : 'ghost'}
                    onClick={handleMicClick}
                    disabled={!isSpeechSupported || isLoading}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                  </Button>
                  <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !attachment)}>
                    <CornerDownLeft className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
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
