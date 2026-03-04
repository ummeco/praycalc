"use client";

import { useState } from "react";

interface WebhookFormProps {
  onSubmit: (data: WebhookFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: WebhookFormData;
}

export interface WebhookFormData {
  callbackUrl: string;
  events: string[];
  lat: number;
  lng: number;
}

const AVAILABLE_EVENTS = [
  { id: "adhan", label: "Adhan (prayer time)" },
  { id: "iqamah", label: "Iqamah" },
  { id: "sunrise", label: "Sunrise" },
  { id: "midnight", label: "Islamic midnight" },
];

export default function WebhookForm({
  onSubmit,
  onCancel,
  initialData,
}: WebhookFormProps) {
  const [callbackUrl, setCallbackUrl] = useState(
    initialData?.callbackUrl ?? ""
  );
  const [events, setEvents] = useState<string[]>(
    initialData?.events ?? ["adhan"]
  );
  const [lat, setLat] = useState(initialData?.lat?.toString() ?? "");
  const [lng, setLng] = useState(initialData?.lng?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setError(null);
      },
      () => {
        setError("Could not get your location. Enter coordinates manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    try {
      new URL(callbackUrl);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com/webhook).");
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError("Latitude must be between -90 and 90.");
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    if (events.length === 0) {
      setError("Select at least one event type.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        callbackUrl,
        events,
        lat: latNum,
        lng: lngNum,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save webhook."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#1E5E2F] bg-[#0A2010] p-5"
    >
      <h3 className="mb-4 text-lg font-semibold text-[#C9F27A]">
        {initialData ? "Edit webhook" : "Add webhook"}
      </h3>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Callback URL */}
      <div className="mb-4">
        <label
          htmlFor="webhook-url"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Callback URL
        </label>
        <input
          id="webhook-url"
          type="url"
          value={callbackUrl}
          onChange={(e) => setCallbackUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
          className="w-full rounded-lg border border-[#1E5E2F] bg-[#0D2F17] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#79C24C] focus:outline-none"
        />
      </div>

      {/* Event types */}
      <div className="mb-4">
        <span className="mb-1.5 block text-sm font-medium text-gray-300">
          Event types
        </span>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_EVENTS.map((evt) => (
            <button
              key={evt.id}
              type="button"
              onClick={() => toggleEvent(evt.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                events.includes(evt.id)
                  ? "bg-[#79C24C] text-[#0D2F17]"
                  : "border border-[#1E5E2F] text-gray-400 hover:border-[#79C24C]/50"
              }`}
            >
              {evt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Location</span>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-xs text-[#79C24C] hover:underline"
          >
            Use current location
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              required
              className="w-full rounded-lg border border-[#1E5E2F] bg-[#0D2F17] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#79C24C] focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              required
              className="w-full rounded-lg border border-[#1E5E2F] bg-[#0D2F17] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#79C24C] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#79C24C] px-5 py-2 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A] disabled:opacity-50"
        >
          {submitting ? "Saving..." : initialData ? "Update" : "Add webhook"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#1E5E2F] px-5 py-2 text-sm text-gray-400 transition hover:bg-[#1E5E2F]/50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
