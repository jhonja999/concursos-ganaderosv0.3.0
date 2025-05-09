"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Building,
  Calendar,
  Tag,
  Users,
  Settings,
  Home,
} from "lucide-react";
import { MilkIcon as Cow } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
        icon: BarChart3,
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
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "Administrador";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <Link href="/dashboard">
          <span className="font-semibold">Panel Concursos Ganaderos</span>
        </Link>
      </div>
      <div className="mx-2 h-px bg-border" />

      {/* Navigation - con scroll */}
      <div className="flex-1 overflow-y-auto pt-2">
        <nav className="flex flex-col px-2">
          <div className="grid items-start gap-1">
            {items.map((item, index) => {
              if (item.items) {
                return (
                  <div key={index} className="pt-2 first:pt-0">
                    <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">
                      {item.title}
                    </h4>
                    <div className="grid gap-1">
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
                  </div>
                );
              }

              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                />
              );
            })}
          </div>
        </nav>
      </div>

      {/* User Footer - fijo en la parte inferior */}
      <div className="border-t bg-background w-full sticky bottom-0 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <div className="text-sm">
              <p className="font-medium truncate max-w-28">{displayName}</p>
              <p className="text-xs text-muted-foreground">Panel de Control</p>
            </div>
          </div>
          <Link href="/home">
            <Button variant="outline" size="icon" className="rounded-full">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive?: boolean;
}

function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent/70 hover:text-accent-foreground",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        isActive
          ? "bg-accent text-accent-foreground border-l-4 border-primary shadow-sm"
          : "text-muted-foreground border-l-4 border-transparent"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          "group-hover:scale-105",
          isActive && "text-primary"
        )}
      />
      <span className="truncate">{title}</span>

      {isActive && (
        <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-sm" />
      )}
    </Link>
  );
}
