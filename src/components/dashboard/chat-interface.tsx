

"use client";

import { tenderQueryTool } from "@/ai/flows/tender-query-tool";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Camera as CameraIcon, ImageUp, X, SlidersHorizontal, FileText, Info, HelpCircle, Plus, ArrowUp, FileSearch, Globe } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Icons } from "../icons";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CameraDialog } from "./camera-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { Message } from '@/hooks/use-chat';
import { useChat } from '@/hooks/use-chat';


type Tool = {
  name: string;
  key: string;
  icon: React.ElementType;
}

export function ChatInterface() {
  const { 
    activeConversation, 
    addMessage,
    isLoading,
    setIsLoading,
  } = useChat();

  const messages = activeConversation?.messages ?? [];

  const [input, setInput] = useState("");
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isToolPopoverOpen, setIsToolPopoverOpen] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  
  const [predefinedQueries, setPredefinedQueries] = useState<Record<string, string[]>>({});
  const [predefinedQueriesEnabled, setPredefinedQueriesEnabled] = useState(false);

  useEffect(() => {
    try {
      const settingsString = localStorage.getItem('tender-ai-settings');
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        if (settings.preBidQueries) {
          setPredefinedQueries(settings.preBidQueries);
        }
        if (typeof settings.preBidQueriesEnabled === 'boolean') {
            setPredefinedQueriesEnabled(settings.preBidQueriesEnabled);
        }
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    
    const handleSettingsUpdate = () => {
       try {
        const settingsString = localStorage.getItem('tender-ai-settings');
        if (settingsString) {
          const settings = JSON.parse(settingsString);
          if (settings.preBidQueries) {
            setPredefinedQueries(settings.preBidQueries);
          }
          if (typeof settings.preBidQueriesEnabled === 'boolean') {
              setPredefinedQueriesEnabled(settings.preBidQueriesEnabled);
          }
        }
      } catch (e) {
        console.error('Failed to load settings from localStorage', e);
      }
    };

    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };

  }, []);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setIsToolPopoverOpen(false);
  };

  const tools: Tool[] = [
    { name: 'Summary', key: 'summary', icon: FileText },
    { name: 'Scrapping', key: 'scrapping', icon: FileSearch },
    { name: 'Search the Web', key: 'searchWeb', icon: Globe },
    { name: 'Details', key: 'details', icon: Info },
    { name: 'Pre Bid Queries', key: 'preBid', icon: HelpCircle },
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
    if (typeof text !== 'string') return text;
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
  
  const renderMessageContent = (content: React.ReactNode) => {
    if (typeof content === 'string') {
        return <p>{highlightTags(content)}</p>;
    }
    if (React.isValidElement(content) && content.type === React.Fragment) {
        const children = React.Children.toArray(content.props.children);
        const imageChild = children.find((child: any) => child.type === Image);
        const textChild = children.find((child: any) => child.type === 'p');

        return (
            <>
                {imageChild}
                {textChild && <p>{highlightTags(textChild.props.children)}</p>}
            </>
        );
    }
    return content;
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setAttachment(dataUri);
      };
      reader.readDataURL(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleCameraCapture = (dataUri: string) => {
    setAttachment(dataUri);
    setIsCameraOpen(false);
  };

  const submitQuery = async (query: string, image?: string | null) => {
    const fullQuery = [...tags, query].join(' ').trim();
    if ((!fullQuery && !image) || isLoading || !activeConversation) return;

    setIsLoading(true);
    const queryWithTool = selectedTool ? `${selectedTool.name}: ${fullQuery}` : fullQuery;
    setInput("");
    setAttachment(null);
    setTags([]);
    
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
        {fullQuery && <p>{queryWithTool}</p>}
      </>
    );
    
    addMessage({
      id: Date.now().toString(),
      content: userMessageContent,
      role: "user",
    });
    setSelectedTool(null);
    
    // Add loading message immediately
    const loadingMessageId = (Date.now() + 1).toString();
     addMessage({
      id: loadingMessageId,
      content: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
      role: "assistant",
    });

    try {
      const result = await tenderQueryTool({ query: queryWithTool, imageDataUri: image || undefined });
      const assistantMessage: Message = {
        id: loadingMessageId,
        content: result.tenderInfo,
        role: "assistant",
      };
      addMessage(assistantMessage, true); // Update the loading message
    } catch (error) {
      console.error("Error querying tender info:", error);
      const errorMessage: Message = {
        id: loadingMessageId,
        content: <p className="text-destructive">Sorry, something went wrong. Please try again.</p>,
        role: "assistant",
      };
       addMessage(errorMessage, true); // Update the loading message
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    const tagRegex = /^@[a-zA-Z]+\s+.+/;

    if (tagRegex.test(trimmedInput)) {
        setTags(prev => [...prev, trimmedInput]);
        setInput('');
    } else {
        submitQuery(input, attachment);
    }
  };
  
  const handleSuggestionQuery = (query: string) => {
    submitQuery(query, attachment);
  }

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{activeConversation?.title || 'TenderAI'}</h1>
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
                <Avatar className="h-8 w-8 border shrink-0">
                   <div className="flex h-full w-full items-center justify-center bg-background">
                    <Icons.logo className="h-5 w-5 text-primary"/>
                   </div>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[85%] sm:max-w-[75%] rounded-lg p-3 text-sm shadow-sm",
                "break-words",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
              )}>
                {renderMessageContent(message.content)}
              </div>
              {message.role === "user" && (
                 <Avatar className="h-8 w-8 shrink-0">
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
          {predefinedQueriesEnabled && selectedTool && predefinedQueries[selectedTool.key]?.length > 0 && (
             <div className="mb-2 sm:mb-4">
              <Carousel
                opts={{
                  align: "start",
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {predefinedQueries[selectedTool.key].map((query, index) => (
                    <CarouselItem key={index} className="pl-2 basis-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 whitespace-normal text-left font-normal"
                        onClick={() => handleSuggestionQuery(query)}
                      >
                        {query}
                      </Button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}
          
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx" />
          <CameraDialog open={isCameraOpen} onOpenChange={setIsCameraOpen} onCapture={handleCameraCapture} />
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1.5 rounded-lg bg-muted p-2 text-sm text-muted-foreground">
                  <span className="font-medium">{highlightTags(tag)}</span>
                  <button
                    type="button"
                    className="-mr-1 rounded-full p-0.5 hover:bg-background"
                    onClick={() => setTags((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove tag</span>
                  </button>
                </div>
              ))}
            </div>
          )}


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
                    placeholder={selectedTool?.name || (isListening ? "Listening..." : "Ask anything, or type '@' for options...")}
                    className="min-h-[60px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    disabled={isLoading || isListening}
                  />
                </PopoverAnchor>
                <div className="flex items-center justify-between p-1 sm:p-2 border-t">
                    <div className="flex items-center gap-1">
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
                                onClick={() => handleToolSelect(tool)}
                                >
                                  <tool.icon className="h-4 w-4" />
                                  <span>{tool.name}</span>
                                </Button>
                            ))}
                            </PopoverContent>
                        </Popover>

                        {selectedTool && (
                            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                                {React.createElement(selectedTool.icon, { className: "h-4 w-4" })}
                                <span className="font-medium">{selectedTool.name}</span>
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
                            className="hidden sm:inline-flex"
                        >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                        </Button>
                        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isLoading || (!input.trim() && !attachment && tags.length === 0)}>
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
