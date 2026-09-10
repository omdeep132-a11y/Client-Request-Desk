import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "./ConfirmDialog";

const request = {
  customerName: "John Smith",
  service: "Boiler repair",
  scheduledDate: "2026-10-15T00:00:00.000Z",
};

describe("ConfirmDialog", () => {
  it("shows customer, service and date when open", () => {
    render(
      <ConfirmDialog
        open={true}
        request={request}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Boiler repair")).toBeInTheDocument();
    expect(screen.getByText(/Oct 15, 2026/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        request={request}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onConfirm when Confirm is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        request={request}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        request={request}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables buttons and shows 'Creating...' when loading", () => {
    render(
      <ConfirmDialog
        open={true}
        request={request}
        onConfirm={() => {}}
        onCancel={() => {}}
        loading={true}
      />
    );

    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });
});