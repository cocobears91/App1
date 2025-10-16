import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProcessingTaskCard } from "@/features/status/components/ProcessingTaskCard";
import { ProcessingTask } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

describe("ProcessingTaskCard", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  const task: ProcessingTask = {
    id: "task-123",
    status: "PROCESSING",
    progress: 2,
    totalSteps: 4,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    message: "Analysing transcripts",
    notionSync: {
      status: "SYNCING",
      lastSyncedAt: new Date().toISOString(),
    },
  };

  it("shows progress details and propagates sync action", async () => {
    const user = userEvent.setup();
    const handleSync = jest.fn();

    render(<ProcessingTaskCard task={task} onSyncRequest={handleSync} isSyncing={false} />);

    expect(screen.getByText(/50% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/Analysing transcripts/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry notion sync/i }));
    expect(handleSync).toHaveBeenCalled();

    await waitFor(() => expect(useAppStore.getState().notionStatus).toBe("SYNCING"));
  });
});
