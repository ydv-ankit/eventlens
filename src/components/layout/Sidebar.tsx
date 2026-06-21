import { cn } from "@/lib/utils";
import {
  Activity, BarChart3, ChevronLeft, ChevronRight,
  FolderOpen, LayoutDashboard, Server, Settings,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderOpen,      label: "Projects",  href: "/projects" },
  { icon: Activity,        label: "Events",    href: "/events" },
  { icon: BarChart3,       label: "Analytics", href: "/analytics" },
  { icon: Server,          label: "System",    href: "/system" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground">
            EventLens
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {NAV.map(({ icon: Icon, label, href }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <Settings size={15} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
