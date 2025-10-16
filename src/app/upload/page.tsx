"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UploadForm, UploadFormValues } from "@/features/upload/components/UploadForm";
import { apiClient } from "@/lib/api-client";
import { UploadMetadata } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function UploadPage() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (values: UploadFormValues) => {
      const metadata: UploadMetadata = {
        workspaceId: values.workspaceId,
        notes: values.notes,
        tags: values.tags,
      };
      return apiClient.uploadZipArchive(values.file, metadata);
    },
    onSuccess: (response) => {
      router.push(`/status/${response.taskId}`);
    },
  });

  const errorMessage = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <div className="space-y-6">
      <Card className="space-y-2 bg-slate-900 text-slate-50">
        <h1 className="text-xl font-semibold">Upload your qualitative research</h1>
        <p className="text-sm text-slate-200">
          Drag in a zip archive of interview notes, call transcripts, or survey exports. We will automatically process the
          documents, cluster insights, and queue a Notion sync when complete.
        </p>
      </Card>

      <UploadForm onSubmit={(values) => mutation.mutate(values)} isSubmitting={mutation.isPending} error={errorMessage} />

      <Alert tone="info">
        Questions from the research team? Share the task link after uploading so they can monitor progress without needing
        engineering support.
      </Alert>
    </div>
  );
}
