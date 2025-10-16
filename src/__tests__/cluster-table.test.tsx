import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClusterTable } from "@/features/clusters/components/ClusterTable";
import { ClusterSummary } from "@/lib/types";

describe("ClusterTable", () => {
  const clusters: ClusterSummary[] = [
    {
      id: "c-1",
      title: "Automated onboarding",
      keywords: ["onboarding", "automation"],
      ideaCount: 4,
      strengthScore: 82,
      summary: "Automate onboarding sequences",
      moderationState: "PENDING",
      createdAt: new Date("2024-01-15").toISOString(),
    },
    {
      id: "c-2",
      title: "Agent assist",
      keywords: ["support", "ai"],
      ideaCount: 6,
      strengthScore: 74,
      summary: "AI agent assistance",
      moderationState: "APPROVED",
      createdAt: new Date("2024-02-10").toISOString(),
    },
  ];

  it("calls callbacks for approve and archive actions", async () => {
    const user = userEvent.setup();
    const handleApprove = jest.fn();
    const handleDelete = jest.fn();

    render(
      <ClusterTable clusters={clusters} onApprove={handleApprove} onDelete={handleDelete} busyClusterId={null} />,
    );

    await user.click(screen.getAllByRole("button", { name: /approve/i })[0]);
    expect(handleApprove).toHaveBeenCalledWith(clusters[0]);

    await user.click(screen.getAllByRole("button", { name: /archive/i })[0]);
    expect(handleDelete).toHaveBeenCalledWith(clusters[0]);
  });

  it("disables approve for already approved clusters", () => {
    render(
      <ClusterTable clusters={clusters} onApprove={jest.fn()} onDelete={jest.fn()} busyClusterId={null} />,
    );

    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    expect(approveButtons[1]).toBeDisabled();
  });
});
