"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  const { user, isLoaded } = useUser()

  return (
    <div className={cn("flex items-center justify-between px-2 py-4", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide text-black dark:text-white">{heading}</h1>
        {text && <p className="text-muted-foreground text-black dark:text-white">{text}</p>}
        {/* <p className="mt-2 text-sm text-primary-foreground/70 text-black dark:text-white">
          <strong>ID de usuario:</strong>{' '}
          {isLoaded && user ? (
            user.id
          ) : (
            <span className="inline-block w-[140px] animate-pulse bg-primary-foreground/20 rounded-sm h-[1em] align-middle" />
          )}
        </p> */}
      </div>
      {children}
    </div>
  )
}
