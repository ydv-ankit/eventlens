import { AppLayout } from "@/components/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import ArchPage from "@/pages/ArchPage";
import DocsPage from "@/pages/DocsPage";
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
import { useEffect, useRef } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
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

// Clears localStorage when a signed-in user signs out
function StorageCleaner() {
  const { isLoaded, isSignedIn } = useAuth();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (prev.current === true && !isSignedIn) {
      localStorage.clear();
    }
    prev.current = isSignedIn ?? false;
  }, [isLoaded, isSignedIn]);

  return null;
}

// Layout route — guards all nested routes; uses Outlet so it can be a route element
function AuthGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <RedirectToSignIn />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <StorageCleaner />
          <Routes>
            {/* Public: landing page shown to unauthenticated visitors */}
            <Route path="/" element={<HomePage />} />
            <Route path="/arch" element={<ArchPage />} />
            <Route path="/docs" element={<DocsPage />} />

            {/* Protected: require sign-in */}
            <Route element={<AuthGate />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/api-keys" element={<ApiKeys />} />
                <Route path="/events" element={<EventExplorer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users/:id" element={<UserTimeline />} />
                <Route path="/system" element={<SystemPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
