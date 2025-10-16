import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadForm } from "@/features/upload/components/UploadForm";

function createFile(filename: string) {
  return new File(["test"], filename, { type: "application/zip" });
}

describe("UploadForm", () => {
  it("submits selected file and metadata", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<UploadForm onSubmit={handleSubmit} isSubmitting={false} error={null} />);

    const fileInput = screen.getByLabelText(/zip archive/i) as HTMLInputElement;
    const file = createFile("insights.zip");
    await user.upload(fileInput, file);
    await screen.findByText(/Selected file: insights.zip/i);

    const workspaceInput = screen.getByLabelText(/workspace identifier/i);
    await user.clear(workspaceInput);
    await user.type(workspaceInput, "research-team");

    const notesTextarea = screen.getByPlaceholderText(/context for this upload/i);
    await user.clear(notesTextarea);
    await user.type(notesTextarea, "Customer interviews");

    const tagsInput = screen.getByLabelText(/tags/i);
    await user.clear(tagsInput);
    await user.type(tagsInput, "alpha, beta");

    await user.click(screen.getByRole("button", { name: /upload and process/i }));
    const form = screen.getByRole("form", { name: /upload data form/i });

    fireEvent.submit(form);

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
    expect(handleSubmit).toHaveBeenCalledWith({
      file,
      workspaceId: "research-team",
      notes: "Customer interviews",
      tags: ["alpha", "beta"],
    });
  });
});
