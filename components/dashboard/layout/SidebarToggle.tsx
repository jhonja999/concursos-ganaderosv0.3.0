"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  children: React.ReactNode
}

export function SidebarToggle({ children }: SidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="h-full relative"
    >
      <div className="relative h-full">
        <div className={cn(
          "transition-all duration-300 ease-in-out h-full",
          isOpen ? "w-64" : "w-0"
        )}>
          {isOpen && (
            <div className="h-full w-64 border-r bg-background">
              {children}
            </div>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "absolute top-6 z-50 h-6 w-6 rounded-full border shadow-md transition-all duration-300",
              isOpen ? "-right-3" : "left-3"
            )}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="hidden">
        {/* Este contenido se oculta cuando el sidebar está colapsado */}
      </CollapsibleContent>
    </Collapsible>
  )
}