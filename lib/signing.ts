import crypto from "crypto";
import { env } from "@/lib/env";
import type { CaseFileReceipt } from "@/lib/schemas";

type KeySource = "env" | "ephemeral";

type SigningState = {
  privateKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
  keySource: KeySource;
};

const SIGNER_NAME = "ovrule.app";
let signingState: SigningState | null = null;
let warnedAboutEphemeralProdKey = false;

function createEphemeralState(): SigningState {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  return {
    privateKey,
    publicKey,
    keySource: "ephemeral",
  };
}

function createEnvState(base64Key: string): SigningState {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(base64Key, "base64"),
    format: "der",
    type: "pkcs8",
  });

  return {
    privateKey,
    publicKey: crypto.createPublicKey(privateKey),
    keySource: "env",
  };
}

function getSigningState() {
  if (signingState) {
    return signingState;
  }

  signingState = env.ovrulePrivateKey ? createEnvState(env.ovrulePrivateKey) : createEphemeralState();

  if (signingState.keySource === "ephemeral" && process.env.NODE_ENV === "production" && !warnedAboutEphemeralProdKey) {
    warnedAboutEphemeralProdKey = true;
    console.error(
      "OVRULE SIGNING WARNING: OVRULE_PRIVATE_KEY is missing in production. Falling back to an ephemeral key.",
    );
  }

  return signingState;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortValue(nested)]),
    );
  }

  return value;
}

export function canonicalizeJson(value: unknown) {
  return JSON.stringify(sortValue(value));
}

export function buildReceiptHashPayload(receipt: Omit<CaseFileReceipt, "signature">) {
  return {
    scenario: receipt.scenario,
    decision: receipt.decision,
    ruleTrace: receipt.ruleTrace,
    timestamp: receipt.timestamp,
    receiptId: receipt.receiptId,
    policyPack: receipt.policyPack ?? "general",
  };
}

export function signableReceipt(receipt: CaseFileReceipt | Omit<CaseFileReceipt, "signature">) {
  const { signature: _signature, ...unsignedReceipt } = receipt as CaseFileReceipt;
  return unsignedReceipt;
}

export function signReceipt(receipt: Omit<CaseFileReceipt, "signature">) {
  const state = getSigningState();
  const payload = canonicalizeJson(signableReceipt(receipt));
  return crypto.sign(null, Buffer.from(payload), state.privateKey).toString("base64");
}

export function verifyReceiptSignature(receipt: CaseFileReceipt, signature: string) {
  const state = getSigningState();
  const payload = canonicalizeJson(signableReceipt(receipt));
  return crypto.verify(null, Buffer.from(payload), state.publicKey, Buffer.from(signature, "base64"));
}

export function getPublicKeyBase64() {
  return getSigningState()
    .publicKey.export({
      type: "spki",
      format: "der",
    })
    .toString("base64");
}

export function getSigningHealth() {
  const state = getSigningState();

  return {
    keySource: state.keySource,
    signer: SIGNER_NAME,
  };
}

export function getSignerName() {
  return SIGNER_NAME;
}
