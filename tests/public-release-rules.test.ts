import { describe, expect, it } from "vitest";

import {
  containsAbsoluteUserPath,
  isSensitiveFilePath,
} from "@/scripts/public-release-rules.mjs";

const windowsUserPath = (
  drive: string,
  user: string,
  ...segments: string[]
) => [drive, "Users", user, ...segments].join("\\");

const posixUserPath = (
  root: "Users" | "home",
  user: string,
  ...segments: string[]
) => ["", root, user, ...segments].join("/");

describe("public release path checks", () => {
  it.each([
    windowsUserPath("C:", "alice", "projects", "aria"),
    ["D:", "Users", "bob", "work", "aria"].join("/"),
    `const path = "C:${"\\\\"}Users${"\\\\"}carol${"\\\\"}Desktop";`,
    posixUserPath("Users", "dana", "work", "aria"),
    posixUserPath("home", "erin", "projects", "aria"),
  ])("detects a user-specific absolute path: %s", (value) => {
    expect(containsAbsoluteUserPath(value)).toBe(true);
  });

  it.each([
    "public/downloads/example.zip",
    "https://example.com/home/user-guide",
    String.raw`C:\Program Files\ARIA`,
    "/usr/local/bin/node",
  ])("does not flag a non-user path: %s", (value) => {
    expect(containsAbsoluteUserPath(value)).toBe(false);
  });
});

describe("public release sensitive file checks", () => {
  it.each([
    ".env",
    ".env.local",
    "config/service-account.pem",
    String.raw`secrets\id_ed25519`,
    "certificate.p12",
  ])("detects a sensitive file name: %s", (value) => {
    expect(isSensitiveFilePath(value)).toBe(true);
  });

  it.each([
    ".env.example",
    ".env.sample",
    ".env.template",
    "docs/API_SETUP.md",
  ])("allows a safe documentation or template file: %s", (value) => {
    expect(isSensitiveFilePath(value)).toBe(false);
  });
});
