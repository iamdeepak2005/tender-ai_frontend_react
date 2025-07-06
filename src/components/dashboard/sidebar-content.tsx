import {
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
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
        {/* Expanded view */}
        <div className="flex w-full items-center justify-between group-data-[state=collapsed]:hidden">
          <Link
            href="/dashboard"
            className="flex flex-1 items-center gap-2 overflow-hidden"
          >
            <Icons.logo className="h-6 w-6 shrink-0 text-primary" />
            <span className="whitespace-nowrap text-lg font-semibold">
              TenderAI
            </span>
          </Link>
          <SidebarTrigger className="hidden shrink-0 md:flex" />
        </div>
        {/* Collapsed view */}
        <div className="hidden w-full items-center justify-center group-data-[state=collapsed]:flex">
          <SidebarTrigger className="hidden md:flex">
            <Icons.logo className="h-6 w-6 shrink-0 text-primary" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupContent>
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={["recent", "favorite", "recommended"]}
          >
            <AccordionItem value="recent">
              <AccordionTrigger className="group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 [&>svg]:group-data-[state=collapsed]:hidden">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 shrink-0 text-accent" />
                  <span className="group-data-[state=collapsed]:hidden">
                    Recent Tenders
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="group-data-[state=collapsed]:hidden">
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li
                      key={`recent-${i}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">
                        {tender}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="favorite">
              <AccordionTrigger className="group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 [&>svg]:group-data-[state=collapsed]:hidden">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 shrink-0 text-accent" />
                  <span className="group-data-[state=collapsed]:hidden">
                    Favourite Tenders
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="group-data-[state=collapsed]:hidden">
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li
                      key={`fav-${i}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">
                        {tender}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="recommended">
              <AccordionTrigger className="group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 [&>svg]:group-data-[state=collapsed]:hidden">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 shrink-0 text-accent" />
                  <span className="group-data-[state=collapsed]:hidden">
                    Recommended Tenders
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="group-data-[state=collapsed]:hidden">
                <ul className="space-y-2 py-2 pl-6">
                  {mockTenders.map((tender, i) => (
                    <li
                      key={`rec-${i}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <a href="#" className="truncate">
                        {tender}
                      </a>
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
