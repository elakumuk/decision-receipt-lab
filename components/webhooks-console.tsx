"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Trash2, Zap } from "lucide-react";
import type { WebhookEventType, WebhookRecord } from "@/lib/schemas";

const eventOptions: WebhookEventType[] = [
  "receipt.created",
  "contest.created",
  "override.created",
];

export function WebhooksConsole() {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>(["receipt.created"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadWebhooks() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/webhooks");
      const data = (await response.json()) as { webhooks: WebhookRecord[] };
      setWebhooks(data.webhooks ?? []);
    } catch {
      setError("Unable to load registered webhooks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWebhooks();
  }, []);

  function toggleEvent(event: WebhookEventType) {
    setEvents((current) =>
      current.includes(event) ? current.filter((item) => item !== event) : [...current, event],
    );
  }

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    setSecret(null);

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events }),
      });
      const data = (await response.json()) as {
        webhook?: WebhookRecord;
        webhookId?: string;
        secret?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to register webhook.");
      }

      if (data.secret) {
        setSecret(data.secret);
      }

      setUrl("");
      setEvents(["receipt.created"]);
      setMessage("Webhook registered.");
      await loadWebhooks();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to register webhook.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete webhook.");
      }

      setMessage("Webhook removed.");
      await loadWebhooks();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete webhook.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleTest(id: string) {
    setBusyId(id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      const data = (await response.json()) as { event?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to deliver webhook test.");
      }

      setMessage(`Test event delivered: ${data.event}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to deliver webhook test.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
          Register webhook
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-neutral-50">
          Subscribe to lifecycle events
        </h2>
        <p className="mt-4 text-sm leading-7 text-neutral-400">
          Register an HTTPS endpoint and Ovrule will POST signed event payloads when receipts,
          contests, and overrides are created.
        </p>

        <label className="mt-6 block text-sm font-medium text-neutral-200">Webhook URL</label>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/ovrule"
          className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15"
        />

        <div className="mt-5">
          <p className="text-sm font-medium text-neutral-200">Events</p>
          <div className="mt-3 space-y-3">
            {eventOptions.map((event) => (
              <label
                key={event}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-neutral-300"
              >
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={() => toggleEvent(event)}
                  className="h-4 w-4 rounded border-white/10 bg-transparent"
                />
                {event}
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={isSubmitting || url.trim().length === 0 || events.length === 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-neutral-100 px-4 py-4 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {isSubmitting ? "Registering…" : "Register webhook"}
        </button>

        {secret ? (
          <div className="mt-5 rounded-[24px] border border-emerald-400/18 bg-emerald-400/8 p-4 text-sm text-emerald-100">
            <p className="font-medium">Save this secret now.</p>
            <p className="mt-2 font-mono break-all">{secret}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
          Registered endpoints
        </p>
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 text-sm text-neutral-500">
              Loading webhooks…
            </div>
          ) : webhooks.length > 0 ? (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <p className="break-all text-sm font-medium text-neutral-100">{webhook.url}</p>
                <p className="mt-2 font-mono text-xs text-neutral-500">
                  {webhook.maskedSecret} · {webhook.createdAt}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={`${webhook.id}-${event}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-300"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleTest(webhook.id)}
                    disabled={busyId === webhook.id}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-400/35"
                  >
                    {busyId === webhook.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(webhook.id)}
                    disabled={busyId === webhook.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-200 transition hover:border-white/18"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/8 bg-black/20 p-5 text-sm text-neutral-500">
              No webhooks registered yet.
            </div>
          )}
        </div>

        {message ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/18 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">
            <Check className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/18 bg-red-400/8 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}
