import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/store/useProjectStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { UserButton } from "@clerk/react";

export function TopNav() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { theme, toggleTheme } = useThemeStore();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-4 gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 font-normal">
            <span className="text-xs text-muted-foreground">
              {selectedProject ? selectedProject.name : "Select project"}
            </span>
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {projects.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => setSelectedProject(p)}>
              {p.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
