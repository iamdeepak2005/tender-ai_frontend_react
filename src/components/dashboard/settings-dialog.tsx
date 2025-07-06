"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabId = "general" | "personalization";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "personalization", label: "Personalization", icon: Wand2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] grid-rows-[auto,1fr] p-0 gap-0 dark bg-zinc-900 text-white border-zinc-700">
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
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "personalization" && <PersonalizationSettings />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-8">
      <SettingsItem title="Theme" description="">
        <Select defaultValue="system">
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
        <Select defaultValue="auto-detect">
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
        <Select defaultValue="auto-detect">
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
            <Select defaultValue="sol">
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
        <Switch defaultChecked={true} />
      </SettingsItem>
    </div>
  );
}

function PersonalizationSettings() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Customization</h2>
                <SettingsItem title="Custom instructions">
                    <Button variant="ghost" className="flex items-center gap-1 text-zinc-400 p-0 h-auto hover:text-white">
                        <span>On</span>
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
                        <Switch defaultChecked={true} />
                    </SettingsItem>
                    <SettingsItem title="Reference chat history" description="Let TenderAI reference recent conversations when responding.">
                        <Switch defaultChecked={true} />
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
