"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building, Calendar, Tag, MilkIcon as Cow, BarChart, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gestión",
    items: [
      {
        title: "Compañías",
        href: "/dashboard/companias",
        icon: Building,
      },
      {
        title: "Concursos",
        href: "/dashboard/concursos",
        icon: Calendar,
      },
      {
        title: "Categorías",
        href: "/dashboard/categorias",
        icon: Tag,
      },
      {
        title: "Ganado",
        href: "/dashboard/ganado",
        icon: Cow,
      },
    ],
  },
  {
    title: "Análisis",
    items: [
      {
        title: "Reportes",
        href: "/dashboard/reportes",
        icon: BarChart,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Usuarios",
        href: "/dashboard/usuarios",
        icon: Users,
      },
      {
        title: "Configuración",
        href: "/dashboard/configuracion",
        icon: Settings,
      },
    ],
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item, index) => {
        if (item.items) {
          return (
            <div key={index} className="pt-4 first:pt-0">
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">{item.title}</h4>
              {item.items.map((subItem) => (
                <NavItem
                  key={subItem.href}
                  href={subItem.href}
                  icon={subItem.icon}
                  title={subItem.title}
                  isActive={pathname === subItem.href}
                />
              ))}
            </div>
          )
        }

        return (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            isActive={pathname === item.href}
          />
        )
      })}
    </nav>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  title: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{title}</span>
    </Link>
  )
}
