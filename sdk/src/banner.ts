const DEFAULT_OVRULE_BASE_URL = "https://decision-receipt-lab.vercel.app";
export const SDK_VERSION = "0.2.2";

export function isQuietModeEnabled() {
  return (
    typeof process !== "undefined" &&
    typeof process.env === "object" &&
    typeof process.env.OVRULE_QUIET !== "undefined" &&
    process.env.OVRULE_QUIET !== ""
  );
}

export function renderBanner() {
  const reset = "\x1b[0m";
  const dim = "\x1b[2m";
  const bold = "\x1b[1m";
  const cyan = "\x1b[36m";
  const magenta = "\x1b[35m";
  const yellow = "\x1b[33m";

  return [
    "",
    `${bold}${cyan}   ╔═══════════════════════════════════════════════╗${reset}`,
    `${bold}${cyan}   ║${reset}   ${bold}O${reset}${magenta}━━${reset}${bold}V${reset}   ${bold}Ovrule${reset} · SDK v${SDK_VERSION}                  ${bold}${cyan}║${reset}`,
    `${bold}${cyan}   ║${reset}         ${dim}Auditable receipts for AI agents${reset}      ${bold}${cyan}║${reset}`,
    `${bold}${cyan}   ╚═══════════════════════════════════════════════╝${reset}`,
    "",
    `   ${bold}Quickstart${reset}`,
    `   ${dim}import { classify } from "ovrule-lab";${reset}`,
    `   ${dim}const receipt = await classify("your agent action", {${reset}`,
    `   ${dim}  baseUrl: "${DEFAULT_OVRULE_BASE_URL}"${reset}`,
    `   ${dim}});${reset}`,
    "",
    `   ${bold}Methods${reset}`,
    `   ${dim}classify(action, opts)${reset}   — full case file audit`,
    `   ${dim}guard(action, opts)${reset}      — returns { allowed, decision, ... }`,
    `   ${dim}verify(receipt, sig, opts)${reset} — verify a signed receipt`,
    "",
    `   ${bold}Docs${reset}     ${yellow}${DEFAULT_OVRULE_BASE_URL}/docs${reset}`,
    `   ${bold}GitHub${reset}   ${yellow}https://github.com/elakumuk/decision-receipt-lab${reset}`,
    "",
  ].join("\n");
}

export function logBanner() {
  if (isQuietModeEnabled()) {
    return;
  }

  console.info(renderBanner());
}

export function getDefaultBaseUrl() {
  return DEFAULT_OVRULE_BASE_URL;
}
