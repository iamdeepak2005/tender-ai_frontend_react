
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Wand2,
  Play,
  HelpCircle,
  ChevronRight,
  Filter,
  X,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type SettingsState = {
  theme: "system" | "dark" | "light";
  language: string;
  spokenLanguage: string;
  voice: string;
  showFollowUpSuggestions: boolean;
  customInstructionsOn: boolean;
  referenceSavedMemories: boolean;
  referenceChatHistory: boolean;
  predefinedFiltersEnabled: boolean;
  predefinedFilters: string[];
  preBidQueriesEnabled: boolean;
  preBidQueries: {
    summary: string[];
    scrapping: string[];
    details: string[];
    preBid: string[];
    searchWeb: string[];
  };
};

const defaultSettings: SettingsState = {
  theme: "system",
  language: "auto-detect",
  spokenLanguage: "auto-detect",
  voice: "sol",
  showFollowUpSuggestions: true,
  customInstructionsOn: true,
  referenceSavedMemories: true,
  referenceChatHistory: true,
  predefinedFiltersEnabled: false,
  predefinedFilters: [],
  preBidQueriesEnabled: true,
  preBidQueries: {
    summary: [
      "Provide a concise summary of the attached tender document.",
      "What are the key takeaways from this document?",
      "Summarize the scope of work.",
      "Give me the executive summary.",
      "Can you provide a brief overview?",
      "Highlight the most important points.",
    ],
    scrapping: [
      "Extract key information like deadlines, budget, and eligibility criteria from the document.",
      "Find all important dates mentioned.",
      "What is the total budget allocated?",
      "List the eligibility requirements for bidders.",
      "Extract contact information for the procurement officer.",
      "What are the submission guidelines?",
    ],
    searchWeb: [
      "Search the web for information related to this tender topic.",
      "Find similar projects that have been completed recently.",
      "Who are the likely competitors for this bid?",
      "What is the issuing authority's track record?",
      "Research the market rate for these services.",
      "Look up news articles about this project.",
    ],
    details: [
      "Give me a detailed breakdown of the requirements and scope of work.",
      "Explain the technical specifications in detail.",
      "What are the evaluation criteria for the bids?",
      "Provide a clause-by-clause analysis of the contract.",
      "What are the payment terms and schedule?",
      "List all required documents for the submission.",
    ],
    preBid: [
      "Generate a list of potential pre-bid questions based on the tender document.",
      "Are there any ambiguities in the scope of work that need clarification?",
      "Draft questions regarding the payment schedule.",
      "What questions should we ask about the evaluation process?",
      "Formulate queries about the technical specifications.",
      "Identify potential risks and ask for clarification.",
    ],
  },
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabId = "general" | "personalization" | "pre-defined-filters" | "pre-bid-queries";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [initialSettings, setInitialSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    if (open) {
      try {
        const storedSettings = localStorage.getItem("tender-ai-settings");
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            // Ensure preBidQueries are arrays, providing backward compatibility
            const migratedQueries = { ...defaultSettings.preBidQueries };
            if (parsed.preBidQueries) {
                for (const key in migratedQueries) {
                    const queryKey = key as keyof typeof migratedQueries;
                    if (typeof parsed.preBidQueries[queryKey] === 'string') {
                         migratedQueries[queryKey] = [parsed.preBidQueries[queryKey]];
                    } else if (Array.isArray(parsed.preBidQueries[queryKey])) {
                        migratedQueries[queryKey] = parsed.preBidQueries[queryKey];
                    }
                }
            }
            const loadedSettings = { ...defaultSettings, ...parsed, preBidQueries: migratedQueries };
            setSettings(loadedSettings);
            setInitialSettings(loadedSettings);
        } else {
             setSettings(defaultSettings);
             setInitialSettings(defaultSettings);
        }
      } catch (e) {
        console.error('Failed to load settings from localStorage', e);
        setSettings(defaultSettings);
        setInitialSettings(defaultSettings);
      }
    }
  }, [open]);

  const applyTheme = (theme: 'system' | 'dark' | 'light') => {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }
  }

  const handleSave = () => {
    applyTheme(settings.theme);
    localStorage.setItem("tender-ai-settings", JSON.stringify(settings));
    onOpenChange(false);
    // Optionally, you could broadcast a change event here for other components to listen to.
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel();
    } else {
      onOpenChange(true);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "personalization", label: "Personalization", icon: Wand2 },
    { id: "pre-defined-filters", label: "Pre-defined filters", icon: Filter },
    { id: "pre-bid-queries", label: "Pre Bid Queries", icon: HelpCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col sm:grid sm:grid-rows-[auto,1fr,auto] p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          <nav className="w-full sm:w-1/3 md:w-1/4 border-b sm:border-b-0 sm:border-r p-2 md:p-4 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.id as TabId)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                <span className="truncate">{tab.label}</span>
              </Button>
            ))}
          </nav>
          <div className="w-full sm:w-2/3 md:w-3/4 p-4 md:p-6 overflow-y-auto">
            {activeTab === "general" && <GeneralSettings settings={settings} setSettings={setSettings} />}
            {activeTab === "personalization" && <PersonalizationSettings settings={settings} setSettings={setSettings} />}
            {activeTab === "pre-defined-filters" && <PredefinedFiltersSettings settings={settings} setSettings={setSettings} />}
            {activeTab === "pre-bid-queries" && <PreBidQueriesSettings settings={settings} setSettings={setSettings} />}
          </div>
        </div>
        <DialogFooter className="p-4 border-t justify-end mt-auto sm:mt-0">
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsProps {
    settings: SettingsState;
    setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
}

function GeneralSettings({ settings, setSettings }: SettingsProps) {
  return (
    <div className="space-y-8">
      <SettingsItem title="Theme" description="">
        <Select 
          value={settings.theme}
          onValueChange={(value: "system" | "dark" | "light") => setSettings(s => ({...s, theme: value}))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator />

      <SettingsItem title="Language" description="">
        <Select 
          value={settings.language}
          onValueChange={(value: string) => setSettings(s => ({...s, language: value}))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto-detect">Auto-detect</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator />

      <SettingsItem title="Spoken language" description="For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.">
        <Select 
            value={settings.spokenLanguage}
            onValueChange={(value: string) => setSettings(s => ({...s, spokenLanguage: value}))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Spoken language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto-detect">Auto-detect</SelectItem>
             <SelectItem value="en-us">English (US)</SelectItem>
             <SelectItem value="en-gb">English (UK)</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator />

      <SettingsItem title="Voice" description="">
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Play className="h-4 w-4 mr-2"/>
                Play
            </Button>
            <Select 
                value={settings.voice}
                onValueChange={(value: string) => setSettings(s => ({...s, voice: value}))}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Voice" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="sol">Sol</SelectItem>
                    <SelectItem value="luna">Luna</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </SettingsItem>
      
      <Separator />

      <SettingsItem title="Show follow up suggestions in chats" description="">
        <Switch 
            checked={settings.showFollowUpSuggestions}
            onCheckedChange={(checked) => setSettings(s => ({...s, showFollowUpSuggestions: checked}))}
        />
      </SettingsItem>
    </div>
  );
}

function PersonalizationSettings({ settings, setSettings }: SettingsProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Customization</h2>
                <SettingsItem title="Custom instructions">
                    <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground p-0 h-auto hover:text-foreground" onClick={() => setSettings(s => ({...s, customInstructionsOn: !s.customInstructionsOn}))}>
                        <span>{settings.customInstructionsOn ? 'On' : 'Off'}</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </SettingsItem>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Memory</h2>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>Memory helps TenderAI remember details from your conversations to be more helpful. You control it.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="space-y-6">
                    <SettingsItem title="Reference saved memories" description="Let TenderAI save and use memories when responding.">
                        <Switch 
                            checked={settings.referenceSavedMemories}
                            onCheckedChange={(checked) => setSettings(s => ({...s, referenceSavedMemories: checked}))}
                        />
                    </SettingsItem>
                    <SettingsItem title="Reference chat history" description="Let TenderAI reference recent conversations when responding.">
                        <Switch 
                            checked={settings.referenceChatHistory}
                            onCheckedChange={(checked) => setSettings(s => ({...s, referenceChatHistory: checked}))}
                        />
                    </SettingsItem>
                    <SettingsItem title="Manage memories">
                        <Button variant="outline">Manage</Button>
                    </SettingsItem>
                </div>
            </div>

            <p className="text-xs text-muted-foreground !mt-8">
                TenderAI may use Memory to personalize queries to search providers.{" "}
                <a href="#" className="underline hover:text-foreground">
                Learn more
                </a>
            </p>
        </div>
    );
}

function PredefinedFiltersSettings({ settings, setSettings }: SettingsProps) {
    const [filterInput, setFilterInput] = useState("");

    const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && filterInput.trim()) {
            e.preventDefault();
            const newFilter = filterInput.trim().replace(/,$/, '');
            if (newFilter && !settings.predefinedFilters.includes(newFilter)) {
                setSettings(s => ({ ...s, predefinedFilters: [...s.predefinedFilters, newFilter] }));
            }
            setFilterInput("");
        }
    };

    const removeFilter = (filterToRemove: string) => {
        setSettings(s => ({
            ...s,
            predefinedFilters: s.predefinedFilters.filter(f => f !== filterToRemove)
        }));
    };

    const colors = [
        "bg-blue-500/20 text-blue-500 dark:text-blue-300 border border-blue-500/30",
        "bg-green-500/20 text-green-600 dark:text-green-300 border border-green-500/30",
        "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30",
        "bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/30",
        "bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/30",
    ];

    return (
        <div className="space-y-6">
            <SettingsItem title="Enable Pre-defined Filters">
                <Switch
                    checked={settings.predefinedFiltersEnabled}
                    onCheckedChange={(checked) => setSettings(s => ({...s, predefinedFiltersEnabled: checked }))}
                />
            </SettingsItem>
            
            <Separator />
            
            <div>
                <Label htmlFor="filter-input" className="text-base font-semibold block mb-1">Your Filters</Label>
                <p className="text-sm text-muted-foreground mb-4">
                    Type a filter and press space, comma, or Enter to add it.
                </p>
                <div className={cn(
                    "flex flex-wrap items-center gap-2 rounded-md border bg-background p-2 min-h-[44px]",
                    !settings.predefinedFiltersEnabled && "opacity-50 bg-muted cursor-not-allowed"
                )}>
                    {settings.predefinedFilters.map((filter, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium",
                                colors[index % colors.length]
                            )}
                        >
                            <span>{filter}</span>
                            <button
                                onClick={() => removeFilter(filter)}
                                className="rounded-full hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
                                disabled={!settings.predefinedFiltersEnabled}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove {filter}</span>
                            </button>
                        </div>
                    ))}
                    <input
                        id="filter-input"
                        type="text"
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                        onKeyDown={handleFilterKeyDown}
                        placeholder={settings.predefinedFilters.length === 0 ? "e.g., chennai, plumber" : ""}
                        className="flex-1 bg-transparent p-1 text-sm placeholder-muted-foreground outline-none min-w-[120px]"
                        disabled={!settings.predefinedFiltersEnabled}
                    />
                </div>
            </div>
        </div>
    );
}

function PreBidQueriesSettings({ settings, setSettings }: SettingsProps) {
    type QueryKey = keyof SettingsState['preBidQueries'];
    
    const [newQueries, setNewQueries] = useState<Record<QueryKey, string>>({
        summary: '',
        scrapping: '',
        details: '',
        preBid: '',
        searchWeb: '',
    });

    const handleInputChange = (key: QueryKey, value: string) => {
        setNewQueries(s => ({ ...s, [key]: value }));
    };

    const handleAddQuery = (key: QueryKey) => {
        const newQuery = newQueries[key].trim();
        if (newQuery) {
            setSettings(s => ({
                ...s,
                preBidQueries: {
                    ...s.preBidQueries,
                    [key]: [...s.preBidQueries[key], newQuery]
                }
            }));
            setNewQueries(s => ({ ...s, [key]: '' }));
        }
    };

    const handleRemoveQuery = (key: QueryKey, indexToRemove: number) => {
        setSettings(s => ({
            ...s,
            preBidQueries: {
                ...s.preBidQueries,
                [key]: s.preBidQueries[key].filter((_, index) => index !== indexToRemove)
            }
        }));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: QueryKey) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddQuery(key);
        }
    };

    const querySections = [
        { key: 'summary' as const, title: 'Summary Queries', description: "Manage your saved queries for the 'Summary' tool." },
        { key: 'scrapping' as const, title: 'Scrapping Queries', description: "Manage your saved queries for the 'Scrapping' tool." },
        { key: 'searchWeb' as const, title: 'Search the Web Queries', description: "Manage your saved queries for the 'Search the Web' tool." },
        { key: 'details' as const, title: 'Details Queries', description: "Manage your saved queries for the 'Details' tool." },
        { key: 'preBid' as const, title: 'Pre-Bid Queries', description: "Manage your saved queries for generating pre-bid questions." },
    ];

    return (
        <div className="space-y-6">
            <SettingsItem title="Enable AI-assisted Pre-Bid Queries">
                <Switch
                    checked={settings.preBidQueriesEnabled}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, preBidQueriesEnabled: checked }))}
                />
            </SettingsItem>
            
            <Separator />

            <div className={cn("space-y-8", !settings.preBidQueriesEnabled && "opacity-50 pointer-events-none")}>
                {querySections.map((section) => (
                    <div key={section.key}>
                        <Label className="text-base font-semibold block mb-1">{section.title}</Label>
                        <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            <Input
                                id={`${section.key}-query-input`}
                                value={newQueries[section.key]}
                                onChange={(e) => handleInputChange(section.key, e.target.value)}
                                onKeyDown={(e) => handleInputKeyDown(e, section.key)}
                                placeholder="Add a new query..."
                                disabled={!settings.preBidQueriesEnabled}
                            />
                            <Button
                                onClick={() => handleAddQuery(section.key)}
                                disabled={!settings.preBidQueriesEnabled || !newQueries[section.key].trim()}
                                className="shrink-0"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {settings.preBidQueries[section.key].map((query, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-3 text-sm">
                                    <p className="flex-1 break-words">{query}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        onClick={() => handleRemoveQuery(section.key, index)}
                                        disabled={!settings.preBidQueriesEnabled}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove query</span>
                                    </Button>
                                </div>
                            ))}
                             {settings.preBidQueries[section.key].length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-2">No queries saved for this category.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsItem({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}
