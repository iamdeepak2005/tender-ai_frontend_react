import {
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icons } from "@/components/icons";
import { FileText, History, Star, ThumbsUp } from "lucide-react";
import Link from "next/link";

const mockTenders = [
  "Road Construction in California",
  "School Building in New York",
  "Bridge Repair in Texas",
  "Park Development in Florida",
  "Water Treatment Plant in WA",
];

export function SidebarContent() {
  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">TenderAI</span>
        </Link>
      </SidebarHeader>
      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupContent>
          <Accordion type="multiple" className="w-full" defaultValue={["recent", "favorite", "recommended"]}>
            <AccordionItem value="recent">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-accent" />
                  <span>Recent Tenders</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li key={`recent-${i}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">{tender}</a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="favorite">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <span>Favourite Tenders</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li key={`fav-${i}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                       <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">{tender}</a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="recommended">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-accent" />
                  <span>Recommended Tenders</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li key={`rec-${i}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                       <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">{tender}</a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
