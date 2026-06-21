import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Theme</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current: {theme === "dark" ? "Dark" : "Light"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-1.5">
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">About</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              EventLens v1 — High-throughput event ingestion &amp; analytics platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
