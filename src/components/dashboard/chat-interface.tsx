
"use client";

import { tenderQueryTool } from "@/ai/flows/tender-query-tool";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Camera as CameraIcon, ImageUp, X, SlidersHorizontal, FileText, Info, HelpCircle, Globe, Plus, ArrowUp, ChevronDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";


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

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setIsToolPopoverOpen(false);
  };

  const tools = [
    { name: 'Summary', icon: FileText },
    { name: 'Details', icon: Info },
    { name: 'Prebid Queries', icon: HelpCircle },
    { name: 'Search the Web', icon: Globe },
  ];


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
    const queryWithTool = selectedTool ? `${selectedTool}: ${query}` : query;
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
        {query && <p>{highlightTags(queryWithTool)}</p>}
      </>
    );

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setSelectedTool(null);

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
      role: "assistant",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const result = await tenderQueryTool({ query: queryWithTool, imageDataUri: image || undefined });
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
      <header className="flex h-14 shrink-0 items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="-ml-2 flex items-center gap-1.5 text-lg font-semibold">
                TenderAI
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel>Models</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center gap-2">
                  <Icons.logo className="h-5 w-5 text-primary" />
                  <span className="font-semibold">TenderAI 1.0</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <div className="flex items-center gap-2">
                  <Icons.logo className="h-5 w-5" />
                  <span>TenderAI 2.0 (Soon)</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
              <div className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                <PopoverAnchor asChild>
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder={selectedTool || (isListening ? "Listening..." : "Ask anything")}
                    className="min-h-[60px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    disabled={isLoading || isListening}
                  />
                </PopoverAnchor>
                <div className="flex items-center justify-between p-2 border-t">
                    <div className="flex items-center gap-1.5">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button type="button" size="icon" variant="ghost">
                                <Plus className="h-5 w-5" />
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

                        <Popover open={isToolPopoverOpen} onOpenChange={setIsToolPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="ghost" size="icon">
                                <SlidersHorizontal className="h-5 w-5" />
                                <span className="sr-only">Tools</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2 mb-2" side="top" align="start">
                            {tools.map((tool) => (
                                <Button
                                key={tool.name}
                                variant="ghost"
                                className="w-full justify-start text-sm p-2 gap-2"
                                onClick={() => handleToolSelect(tool.name)}
                                >
                                  <tool.icon className="h-4 w-4" />
                                  <span>{tool.name}</span>
                                </Button>
                            ))}
                            </PopoverContent>
                        </Popover>

                        {selectedTool && (
                            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                                {React.createElement(tools.find((t) => t.name === selectedTool)!.icon, { className: "h-4 w-4" })}
                                <span className="font-medium">{selectedTool}</span>
                                <button
                                    type="button"
                                    className="-mr-1.5 rounded-full p-0.5 hover:bg-background/50"
                                    onClick={() => setSelectedTool(null)}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Clear tool</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
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
                        <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || (!input.trim() && !attachment)}>
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
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
