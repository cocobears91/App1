"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export interface UploadFormValues {
  file: File;
  workspaceId: string;
  notes: string;
  tags: string[];
}

interface UploadFormProps {
  onSubmit: (values: UploadFormValues) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function UploadForm({ onSubmit, isSubmitting, error }: UploadFormProps) {
  const [fileName, setFileName] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState("customer-success");
  const [notes, setNotes] = useState("Weekly discovery sync");
  const [tags, setTags] = useState("interviews, onboarding");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.item(0);
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      setFileName("");
      setSelectedFile(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a zip file to upload.");
      return;
    }

    onSubmit({
      file: selectedFile,
      workspaceId,
      notes,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <Card className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5" aria-label="Upload data form">
        <section className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium" htmlFor="zip-upload">
            Zip archive
            <span className="text-xs font-normal text-slate-500">.zip files only</span>
          </label>
          <input
            ref={inputRef}
            id="zip-upload"
            type="file"
            accept=".zip"
            required
            className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
            onChange={(event) => handleFileSelect(event.target.files)}
          />
          {fileName && <p className="text-xs text-slate-500">Selected file: {fileName}</p>}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            Workspace identifier
            <input
              type="text"
              value={workspaceId}
              onChange={(event) => setWorkspaceId(event.target.value)}
              placeholder="marketing-team"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:border-slate-800 dark:bg-slate-900"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Tags
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="launch, interviews"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:border-slate-800 dark:bg-slate-900"
            />
          </label>
        </section>

        <label className="space-y-2 text-sm font-medium">
          Notes for reviewers
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:border-slate-800 dark:bg-slate-900"
            placeholder="Context for this upload"
          />
          <span className="block text-xs text-slate-500">
            Share any context that will help reviewers make faster decisions.
          </span>
        </label>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Upload and process
          </Button>
          <Button type="button" variant="ghost" onClick={() => inputRef.current?.focus()}>
            Need help? Read the guide
          </Button>
        </div>
      </form>
    </Card>
  );
}
