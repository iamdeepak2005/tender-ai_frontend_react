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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabId = "general" | "personalization" | "pre-defined-filters";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [initialSettings, setInitialSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    if (open) {
      const storedSettings = localStorage.getItem("tender-ai-settings");
      const loadedSettings = storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
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
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] grid-rows-[auto,1fr,auto] p-0 gap-0 dark bg-zinc-900 text-white border-zinc-700">
        <DialogHeader className="p-4 border-b border-zinc-700">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex overflow-hidden">
          <nav className="w-1/3 md:w-1/4 border-r border-zinc-700 p-2 md:p-4 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className="w-full justify-start hover:bg-zinc-800 data-[state=active]:bg-zinc-800"
                onClick={() => setActiveTab(tab.id as TabId)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                <span className="truncate">{tab.label}</span>
              </Button>
            ))}
          </nav>
          <div className="w-2/3 md:w-3/4 p-4 md:p-6 overflow-y-auto">
            {activeTab === "general" && <GeneralSettings settings={settings} setSettings={setSettings} />}
            {activeTab === "personalization" && <PersonalizationSettings settings={settings} setSettings={setSettings} />}
            {activeTab === "pre-defined-filters" && <PredefinedFiltersSettings settings={settings} setSettings={setSettings} />}
          </div>
        </div>
        <DialogFooter className="p-4 border-t border-zinc-700 justify-end">
          <Button variant="ghost" className="hover:bg-zinc-800" onClick={handleCancel}>Cancel</Button>
          <Button className="bg-white text-black hover:bg-zinc-200" onClick={handleSave}>Save</Button>
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
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-600">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator className="bg-zinc-700"/>

      <SettingsItem title="Language" description="">
        <Select 
          value={settings.language}
          onValueChange={(value: string) => setSettings(s => ({...s, language: value}))}
        >
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-600">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto-detect">Auto-detect</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator className="bg-zinc-700"/>

      <SettingsItem title="Spoken language" description="For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.">
        <Select 
            value={settings.spokenLanguage}
            onValueChange={(value: string) => setSettings(s => ({...s, spokenLanguage: value}))}
        >
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-600">
            <SelectValue placeholder="Spoken language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto-detect">Auto-detect</SelectItem>
             <SelectItem value="en-us">English (US)</SelectItem>
             <SelectItem value="en-gb">English (UK)</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <Separator className="bg-zinc-700"/>

      <SettingsItem title="Voice" description="">
        <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-zinc-800 border-zinc-600 hover:bg-zinc-700">
                <Play className="h-4 w-4 mr-2"/>
                Play
            </Button>
            <Select 
                value={settings.voice}
                onValueChange={(value: string) => setSettings(s => ({...s, voice: value}))}
            >
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-600">
                    <SelectValue placeholder="Voice" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="sol">Sol</SelectItem>
                    <SelectItem value="luna">Luna</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </SettingsItem>
      
      <Separator className="bg-zinc-700"/>

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
                    <Button variant="ghost" className="flex items-center gap-1 text-zinc-400 p-0 h-auto hover:text-white" onClick={() => setSettings(s => ({...s, customInstructionsOn: !s.customInstructionsOn}))}>
                        <span>{settings.customInstructionsOn ? 'On' : 'Off'}</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </SettingsItem>
            </div>

            <Separator className="bg-zinc-700" />
            
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Memory</h2>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-zinc-400" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-800 text-white border-zinc-700 max-w-xs">
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
                        <Button variant="outline" className="bg-zinc-800 border-zinc-600 hover:bg-zinc-700">Manage</Button>
                    </SettingsItem>
                </div>
            </div>

            <p className="text-xs text-zinc-500 !mt-8">
                TenderAI may use Memory to personalize queries to search providers.{" "}
                <a href="#" className="underline hover:text-zinc-400">
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
        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        "bg-green-500/20 text-green-300 border border-green-500/30",
        "bg-purple-500/20 text-purple-300 border border-purple-500/30",
        "bg-orange-500/20 text-orange-300 border border-orange-500/30",
        "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    ];

    return (
        <div className="space-y-6">
            <SettingsItem title="Enable Pre-defined Filters">
                <Switch
                    checked={settings.predefinedFiltersEnabled}
                    onCheckedChange={(checked) => setSettings(s => ({...s, predefinedFiltersEnabled: checked }))}
                />
            </SettingsItem>
            
            <Separator className="bg-zinc-700"/>
            
            <div>
                <Label htmlFor="filter-input" className="text-base font-semibold block mb-1">Your Filters</Label>
                <p className="text-sm text-zinc-400 mb-4">
                    Type a filter and press space, comma, or Enter to add it.
                </p>
                <div className={cn(
                    "flex flex-wrap items-center gap-2 rounded-md border border-zinc-600 bg-zinc-800 p-2 min-h-[44px]",
                    !settings.predefinedFiltersEnabled && "opacity-50 bg-zinc-700/50 cursor-not-allowed"
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
                                className="rounded-full hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:cursor-not-allowed"
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
                        className="flex-1 bg-transparent p-1 text-sm text-white placeholder-zinc-500 outline-none min-w-[120px]"
                        disabled={!settings.predefinedFiltersEnabled}
                    />
                </div>
            </div>
        </div>
    );
}


function SettingsItem({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-zinc-400 max-w-md">{description}</p>}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
