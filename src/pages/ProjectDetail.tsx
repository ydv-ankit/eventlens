import { projectsApi } from "@/api/projects";
import Dashboard from "./Dashboard";
import ApiKeys from "./ApiKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/useProjectStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id!);
  const { setSelectedProject } = useProjectStore();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId),
  });

  useEffect(() => {
    if (project) setSelectedProject(project);
  }, [project, setSelectedProject]);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;
  if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  return (
    <div>
      <PageHeader title={project.name} description={project.description ?? undefined} />
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Dashboard /></TabsContent>
        <TabsContent value="apikeys"><ApiKeys /></TabsContent>
      </Tabs>
    </div>
  );
}
