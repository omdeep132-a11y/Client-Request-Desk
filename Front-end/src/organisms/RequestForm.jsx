import { useState } from "react";
import FormField from "../molecules/FormField";
import Input from "../atoms/Input";
import Textarea from "../atoms/Textarea";
import Button from "../atoms/Button";

export default function RequestForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState({
    customerName: initial?.customerName || "",
    service: initial?.service || "",
    scheduledDate: initial?.scheduledDate
      ? initial.scheduledDate.slice(0, 10)
      : "",
    notes: initial?.notes || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim())
      errs.customerName = "Customer name is required";
    if (!form.service.trim()) errs.service = "Service is required";
    if (!form.scheduledDate) errs.scheduledDate = "Scheduled date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    // Send scheduledDate as midnight UTC to avoid timezone shifts
    const payload = {
      ...form,
      scheduledDate: form.scheduledDate
        ? new Date(`${form.scheduledDate}T00:00:00Z`).toISOString()
        : form.scheduledDate,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setApiError(
        err.response?.data?.error || "Failed to save. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <FormField
        label="Customer name"
        htmlFor="customerName"
        error={errors.customerName}
      >
        <Input
          id="customerName"
          value={form.customerName}
          onChange={set("customerName")}
          error={errors.customerName}
          placeholder="e.g. John Smith"
        />
      </FormField>

      <FormField
        label="Requested service"
        htmlFor="service"
        error={errors.service}
      >
        <Input
          id="service"
          value={form.service}
          onChange={set("service")}
          error={errors.service}
          placeholder="e.g. Boiler repair"
        />
      </FormField>

      <FormField
        label="Scheduled date"
        htmlFor="scheduledDate"
        error={errors.scheduledDate}
      >
        <Input
          id="scheduledDate"
          type="date"
          value={form.scheduledDate}
          onChange={set("scheduledDate")}
          error={errors.scheduledDate}
        />
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes">
        <Textarea
          id="notes"
          rows="3"
          value={form.notes}
          onChange={set("notes")}
          placeholder="Any additional details..."
        />
      </FormField>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}