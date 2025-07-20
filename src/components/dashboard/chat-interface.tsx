

"use client";

// Tender query functionality removed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Camera as CameraIcon, ImageUp, X, SlidersHorizontal, FileText, Info, HelpCircle, Plus, ArrowUp, FileSearch, Globe, Copy, Star, ThumbsUp, ThumbsDown } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { createRoot } from "react-dom/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DangerousHTML = ({ html }: { html: string }) => {
    // Attempt to create a table from the procurement details
    const procurementDetailsRegex = /Procurement Details([\s\S]*?)Eligibility & Compliance/s;
    const match = html.match(procurementDetailsRegex);

    if (match && match[1]) {
        const detailsContent = match[1];
        const items = detailsContent.trim().split(/\n\s*\n/);
        
        const tableRows = items.map(item => {
            const lines = item.trim().split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length >= 3) {
                const [name, quantity, specs] = lines;
                return { name, quantity, specs };
            }
            return null;
        }).filter(Boolean);
        
        if (tableRows.length > 0) {
            const tableHtml = `
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 my-2">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specifications</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        ${tableRows.map(row => `
                            <tr>
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${row!.name}</td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${row!.quantity}</td>
                                <td class="px-3 py-2 whitespace-normal text-sm text-gray-500 dark:text-gray-400">${row!.specs}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Reconstruct the HTML
            const beforeDetails = html.substring(0, match.index! + "Procurement Details".length);
            const afterDetails = html.substring(match.index! + match[0].length - "Eligibility & Compliance".length);
            const finalHtml = `${beforeDetails}${tableHtml}<br/>${afterDetails}`;
            
            return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
        }
    }
  
    // Fallback for original content or if table creation fails
    return <div dangerouslySetInnerHTML={{ __html: html.replace(/(Eligibility & Compliance)/, '<br/>$1') }} />;
};

const getPlainText = (content: React.ReactNode): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (React.isValidElement(content)) {
    const tempDiv = document.createElement('div');
    const root = createRoot(tempDiv);
    root.render(content as React.ReactElement);
    const text = tempDiv.innerText;
    return text;
  }
  return 'Favorite Item';
}

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
    addFavorite,
    favorites,
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
  const { toast } = useToast();
// Add this useEffect hook near your other useEffect hooks
useEffect(() => {
  const fetchPredefinedQuestions = async () => {
    try {
      const token = getAuthToken();
      console.log("Fetching predefined questions...");
      
      const response = await fetch(
        `http://localhost:8000/tenders/questions/?ownerid=1&category=1`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch predefined questions: ${response.status}`);
      }

      const questions = await response.json();
      console.log("Predefined questions API called successfully");
      console.log("Predefined questions:", questions);
      
      // You can add these questions to your chat if needed
      // For example:
      if (Array.isArray(questions) && questions.length > 0) {
        addMessage({
          id: `predefined-${Date.now()}`,
          content: (
            <div className="space-y-2">
              <p className="font-semibold">Here are some predefined questions you might want to ask:</p>
              <ul className="list-disc pl-5 space-y-1">
                {questions.map((q: any, index: number) => (
                  <li key={index}>{q.question}</li>
                ))}
              </ul>
            </div>
          ),
          role: 'assistant'
        });
      }

    } catch (error) {
      console.error("Error fetching predefined questions:", error);
    }
  };

  // Call the function when the component mounts
  fetchPredefinedQuestions();
}, []); // Empty dependency array means this runs once on mount
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
    // Handle string content
    if (typeof content === 'string') {
      return <p>{highlightTags(content)}</p>;
    }
    
    // Handle React elements
    if (React.isValidElement(content)) {
      // If it's a Fragment, process its children
      if (content.type === React.Fragment) {
        const children = React.Children.toArray(content.props.children);
        const processedChildren = children.map((child, index) => {
          // If child is a string, highlight tags in it
          if (typeof child === 'string') {
            return <span key={index}>{highlightTags(child)}</span>;
          }
          // If child is a paragraph, process its content
          if (React.isValidElement(child) && child.type === 'p') {
            return <p key={index}>{highlightTags(child.props.children)}</p>;
          }
          // Otherwise return the child as is
          return child;
        });
        return <>{processedChildren}</>;
      }
      
      // For other React elements, return them as is
      return content;
    }
    
    // For any other type of content, convert to string and render
    return <p>{String(content)}</p>;
  };

  const copyMessageToClipboard = (content: React.ReactNode) => {
    const textToCopy = getPlainText(content);
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => toast({ title: 'Copied to clipboard!' }))
            .catch(err => toast({ title: 'Failed to copy', variant: 'destructive' }));
    }
  };


  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // For preview purposes (keep the first file for preview)
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUri = e.target.result as string;
          setAttachment(dataUri);
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
      
      // Store the files for later upload
      setSelectedFiles(files);
      
      // Reset the input value to allow selecting the same file again
      if (event.target) event.target.value = '';
    } catch (error) {
      console.error('Error handling file selection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      addMessage({
        id: Date.now().toString(),
        content: <p>Error: {errorMessage}</p>,
        role: 'assistant',
      });
    }
  };

  const uploadFiles = async (files: FileList) => {
    console.log("uploading files");
    const formData = new FormData();
    
    // Add files to FormData - FastAPI expects a list of files with the same name 'files'
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
  
    // Add owner_id (required) and tender_id (optional) from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tenderId = urlParams.get('tenderId') || urlParams.get('tender_id');
    const ownerId = urlParams.get('ownerId') || urlParams.get('owner_id');
    
    if (!ownerId) {
      throw new Error('owner_id is required');
    }
    
    formData.append('owner_id', ownerId);
    if (tenderId) {
      formData.append('tender_id', tenderId);
    }
  
    try {
      const response = await fetch('http://localhost:8000/tenders/documents', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with the boundary
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          `Error uploading files: ${response.status} ${response.statusText}`
        );
      }
  
      const result = await response.json();
      console.log('Files uploaded successfully:', result);
      
      // Add success message to the chat
      addMessage({
        id: Date.now().toString(),
        content: `Uploaded ${files.length} file(s) successfully`,
        role: 'assistant',
      });
  
      return result; // Return the result for potential use in submitQuery
  
    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Add error message to chat - ensure content is a valid React node
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage({
        id: Date.now().toString(),
        content: <p>Error uploading files: {errorMessage}</p>,
        role: 'assistant',
      });
      throw error; // Re-throw to be caught by the caller
    }
  };
  const handleCameraCapture = (dataUri: string) => {
    setAttachment(dataUri);
    setIsCameraOpen(false);
  };
  const getAuthToken = (): string | null => {
    return sessionStorage.getItem('access_token');
  };
 // Add this state variable to track document IDs
const [uploadedDocumentIds, setUploadedDocumentIds] = useState<number[]>([]);

// Modify the submitQuery function to handle existing and new documents
const submitQuery = async (query: string, image?: string | null) => {
  // Early exit if no files, no query, and no web search/pre-bid
  if (
    !selectedFiles && 
    !image && 
    uploadedDocumentIds.length === 0 && 
    !query.trim() && 
    !['searchWeb', 'preBid'].includes(selectedTool?.key || '')
  ) {
    return;
  }

  setIsLoading(true);
  const token = getAuthToken();
  let newDocumentIds: number[] = [];

  try {
    // 1️⃣ Upload files (if any) — required for preBid and other tools
    if (selectedFiles || image) {
      const formData = new FormData();

      if (selectedFiles && selectedFiles.length > 0) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append('files', file);
        });
      } else if (image) {
        const blob = await fetch(image).then(r => r.blob());
        formData.append('files', blob, 'captured-image.jpg');
      }

      formData.append('owner_id', "1");

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const uploadResponse = await fetch('http://localhost:8000/tenders/documents', {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed (${uploadResponse.status})`);
      }

      const uploadData = await uploadResponse.json();
      newDocumentIds = uploadData.document_ids;
      setUploadedDocumentIds(prev => [...prev, ...newDocumentIds]);

      addMessage({
        id: Date.now().toString(),
        content: <p>✅ Documents uploaded successfully!</p>,
        role: 'assistant',
      });
    }

    // 2️⃣ Process query (if exists) or pre-bid request
    if (query.trim() || selectedTool?.key === 'preBid') {
      const messageId = Date.now().toString();
      if (query.trim()) {
        addMessage({
          id: messageId,
          content: <p>{query}</p>,
          role: "user",
        });
      }

      const allDocumentIds = [...uploadedDocumentIds, ...newDocumentIds];
      let response;

      const handleErrorResponse = async (response: Response) => {
        const errorBody = await response.text();
        try {
          const errorJson = JSON.parse(errorBody);
          if (errorJson.detail) {
            if (Array.isArray(errorJson.detail)) {
              return errorJson.detail.map((d: any) => d.msg).join(', ');
            }
            return errorJson.detail;
          }
        } catch (e) {
          // Not a JSON response, return the raw text
          return errorBody || `Request failed with status ${response.status}`;
        }
        return `Request failed with status ${response.status}`;
      };

      // 🛠️ Handle tool-specific logic
      switch (selectedTool?.key) {
        case 'searchWeb': {
          // 🔍 Web Search: POST /bids with prompt
          response = await fetch('http://localhost:8000/tenders/bids', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt: query }),
          });

          if (!response.ok) {
            const errorMessage = await handleErrorResponse(response);
            throw new Error(errorMessage);
          }

          const searchData = await response.json();
          const tableContent = (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(searchData).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(searchData).map((value: any, index) => (
                      <td key={index} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-b">
                        {value || 'Not Available'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );

          addMessage({
            id: Date.now().toString(),
            content: tableContent,
            role: 'assistant',
          });
          break;
        }

        case 'preBid': {
          // ❓ Pre Bid Queries: GET /questions?category=0&document_id=... (multiple)
          if (allDocumentIds.length === 0) {
            throw new Error("No documents uploaded for pre-bid queries.");
          }

          const preBidQueryParams = new URLSearchParams();
          preBidQueryParams.append("ownerid", "1");
          preBidQueryParams.append("category", "0");
          
          // Append all document IDs as multiple document_id parameters
          allDocumentIds.forEach(id => {
            preBidQueryParams.append("document_id", id.toString());
          });

          response = await fetch(
            `http://localhost:8000/tenders/questions/?${preBidQueryParams.toString()}`,
            {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );

          if (!response.ok) {
            const errorMessage = await handleErrorResponse(response);
            throw new Error(errorMessage);
          }

          const questionsData = await response.json();
          
          // Format response with document context
          addMessage({
            id: Date.now().toString(),
            content: (
              <div className="space-y-4">
                <p className="font-semibold">📋 Pre-Bid Questions (Documents: {allDocumentIds.join(', ')})</p>
                {Array.isArray(questionsData) ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {questionsData.map((question, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        <p className="font-medium text-blue-600">{question.question || 'Question'}</p>
                        <p className="text-gray-700">{question.answer || 'No answer available'}</p>
                        {question.reference && (
                          <p className="text-sm text-gray-500 mt-1">Reference: {question.reference}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(questionsData, null, 2)}
                  </pre>
                )}
              </div>
            ),
            role: 'assistant',
          });
          break;
        }

        default: {
          const view = selectedTool?.key || "summary";
          const defaultQueryParams = new URLSearchParams();
          defaultQueryParams.append("owner_id", "1");
          defaultQueryParams.append("user_query", query);
          allDocumentIds.forEach((id) => defaultQueryParams.append("document_ids", id.toString()));

          response = await fetch(
            `http://localhost:8000/tenders/bids/${view}/?${defaultQueryParams.toString()}`,
            { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (!response.ok) {
            const errorMessage = await handleErrorResponse(response);
            throw new Error(errorMessage);
          }

          const answerText = await response.text();
          let answerContent: React.ReactNode;
          try {
              const answerJson = JSON.parse(answerText);
              if (answerJson && typeof answerJson.answer === 'string') {
                  answerContent = <DangerousHTML html={answerJson.answer} />;
              } else {
                  answerContent = <DangerousHTML html={answerText} />;
              }
          } catch (e) {
              answerContent = <DangerousHTML html={answerText} />;
          }

          addMessage({
              id: Date.now().toString(),
              content: answerContent,
              role: 'assistant'
          });
          break;
        }
      }
    }

  } catch (error) {
    console.error('Error in submitQuery:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addMessage({
      id: Date.now().toString(),
      content: <p>❌ Error: {errorMessage}</p>,
      role: 'assistant',
    });
  } finally {
    setIsLoading(false);
    setSelectedFiles(null);
    setInput("");
    setAttachment(null);
    setTags([]);
    // Keep selectedTool for continuity
  }
};
const clearUploadedDocuments = () => {
  setUploadedDocumentIds([]);
};
  
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

  const handleFavorite = (message: Message) => {
    addFavorite(message);
    toast({ title: 'Added to favorites!' });
  };

  const isFavorited = (messageId: string) => {
    return favorites.some(fav => fav.id === messageId);
  }

  return (
    <div className="relative flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10 sm:pt-20">
              <Icons.logo className="h-16 w-16 mb-4 text-primary/30" />
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Smarter Procurements Starts Here - Tender AI
              </h2>
              <p className="mt-2 text-md text-muted-foreground">
                Brain Behind Tender
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={cn("group flex items-start gap-4", message.role === "user" ? "justify-end" : "")}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border shrink-0">
                   <div className="flex h-full w-full items-center justify-center bg-background">
                    <Icons.logo className="h-5 w-5 text-primary"/>
                   </div>
                </Avatar>
              )}
              <div className="flex-grow max-w-[85%] sm:max-w-[75%]">
                <div className={cn(
                  "rounded-lg p-3 text-sm shadow-sm",
                  "break-words",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                )}>
                  {renderMessageContent(message.content)}
                </div>
                {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                       <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyMessageToClipboard(message.content)}>
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copy</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFavorite(message)}>
                                    <Star className={cn("h-4 w-4", isFavorited(message.id) && "fill-current text-yellow-400")} />
                                    <span className="sr-only">Favorite</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Favorite</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="sr-only">Like</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Like</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ThumbsDown className="h-4 w-4" />
                                    <span className="sr-only">Dislike</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dislike</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                )}
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
             <div className="mb-2">
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
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" 
            multiple
            onClick={(e) => {
              // Reset the value to allow selecting the same file again
              (e.target as HTMLInputElement).value = '';
            }}
          />
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
                    className="min-h-[60px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0 text-base"
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
