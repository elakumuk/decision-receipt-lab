import crypto from "crypto";
import { getServerSupabaseClient } from "@/lib/supabase";
import type {
  WebhookDeliveryPayload,
  WebhookEventType,
  WebhookRecord,
  WebhookRegistrationInput,
} from "@/lib/schemas";

type WebhookRow = {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  created_at: string;
};

const SIGNATURE_HEADER = "X-Ovrule-Signature";

function maskSecret(secret: string) {
  if (secret.length <= 8) {
    return "••••";
  }

  return `${secret.slice(0, 4)}••••${secret.slice(-4)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function signWebhookBody(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function mapWebhookRow(row: WebhookRow): WebhookRecord {
  return {
    id: row.id,
    url: row.url,
    events: row.events,
    createdAt: row.created_at,
    maskedSecret: maskSecret(row.secret),
  };
}

export async function listWebhooks() {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return [] as WebhookRecord[];
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<WebhookRow[]>();

  if (error || !data) {
    console.error("Failed to list webhooks", error);
    return [] as WebhookRecord[];
  }

  return data.map(mapWebhookRow);
}

export async function registerWebhook(input: WebhookRegistrationInput) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Webhook registration is not configured right now.");
  }

  const secret = crypto.randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      url: input.url,
      events: input.events,
      secret,
    })
    .select("id,url,events,secret,created_at")
    .single<WebhookRow>();

  if (error || !data) {
    console.error("Failed to register webhook", error);
    throw new Error("Unable to register webhook right now.");
  }

  return {
    webhook: mapWebhookRow(data),
    secret,
  };
}

export async function deleteWebhook(id: string) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Webhook deletion is not configured right now.");
  }

  const { error } = await supabase.from("webhooks").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete webhook", error);
    throw new Error("Unable to delete webhook right now.");
  }
}

async function getWebhooksForEvent(event: WebhookEventType) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return [] as WebhookRow[];
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .contains("events", [event])
    .returns<WebhookRow[]>();

  if (error || !data) {
    console.error("Failed to fetch webhooks for event", error);
    return [] as WebhookRow[];
  }

  return data;
}

async function deliverToWebhook(row: WebhookRow, payload: WebhookDeliveryPayload) {
  const body = JSON.stringify(payload);
  const signature = signWebhookBody(body, row.secret);

  const send = async () =>
    fetch(row.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SIGNATURE_HEADER]: signature,
      },
      body,
    });

  try {
    const firstResponse = await send();

    if (firstResponse.ok) {
      return { ok: true };
    }

    await sleep(2_000);
    const retryResponse = await send();
    return { ok: retryResponse.ok };
  } catch (error) {
    console.error("Webhook delivery failed", error);
    await sleep(2_000);

    try {
      const retryResponse = await send();
      return { ok: retryResponse.ok };
    } catch (retryError) {
      console.error("Webhook retry failed", retryError);
      return { ok: false };
    }
  }
}

export async function triggerWebhookEvent(event: WebhookEventType, data: Record<string, unknown>) {
  const hooks = await getWebhooksForEvent(event);

  if (hooks.length === 0) {
    return;
  }

  const payload: WebhookDeliveryPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled(hooks.map((hook) => deliverToWebhook(hook, payload)));
}

export async function sendTestWebhook(id: string) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Webhook testing is not configured right now.");
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("id", id)
    .maybeSingle<WebhookRow>();

  if (error || !data) {
    console.error("Failed to fetch webhook for test", error);
    throw new Error("Webhook not found.");
  }

  const event = data.events[0] ?? "receipt.created";
  const payload: WebhookDeliveryPayload = {
    event,
    data: {
      test: true,
      webhookId: data.id,
      note: "Ovrule test delivery",
    },
    timestamp: new Date().toISOString(),
  };

  const result = await deliverToWebhook(data, payload);

  if (!result.ok) {
    throw new Error("Webhook test delivery failed.");
  }

  return {
    event,
    maskedSecret: maskSecret(data.secret),
  };
}
