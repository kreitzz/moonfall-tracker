import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_ACCESS_COOKIE = "moonfall_site_access";

export function getSitePassword() {
  return process.env.SITE_ACCESS_PASSWORD || "Mead";
}

export function getSiteAccessToken() {
  const password = getSitePassword();
  const secret = process.env.SITE_ACCESS_SECRET || `moonfall:${password}:site-access-v1`;
  return createHmac("sha256", secret).update(password).digest("hex");
}

export function isValidSiteAccessToken(value: string | undefined) {
  if (!value) return false;
  const expected = Buffer.from(getSiteAccessToken());
  const received = Buffer.from(value);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

