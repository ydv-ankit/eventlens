import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import ApiKeys from "@/pages/ApiKeys";
import EventExplorer from "@/pages/EventExplorer";
import Analytics from "@/pages/Analytics";
import UserTimeline from "@/pages/UserTimeline";
import SystemPage from "@/pages/System";
import Settings from "@/pages/Settings";
import { useThemeStore } from "@/store/useThemeStore";
import { setTokenGetter } from "@/api/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RedirectToSignIn, useAuth } from "@clerk/react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <RedirectToSignIn />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthGate>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/api-keys" element={<ApiKeys />} />
                <Route path="/events" element={<EventExplorer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users/:id" element={<UserTimeline />} />
                <Route path="/system" element={<SystemPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </AuthGate>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
