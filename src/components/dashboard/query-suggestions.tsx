"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const suggestions = [
  "Find tenders for road construction in California",
  "Show me tenders with a budget over $2,000,000",
  "List all bridge repair projects in Texas",
  "What are the latest park development tenders?",
];

export function QuerySuggestions({ onSelectQuery }: { onSelectQuery: (query: string) => void }) {
  return (
    <div className="mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 pb-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="p-3 text-left border rounded-lg hover:bg-muted transition-colors"
              onClick={() => onSelectQuery(s)}
            >
              <p className="text-sm">{s}</p>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
