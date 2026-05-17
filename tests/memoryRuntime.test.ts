import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const memoryPageScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/memory/memory.ts", import.meta.url)),
  "utf8"
);

describe("memory page runtime dependencies", () => {
  it("keeps the page script self-contained for WeChat runtime", () => {
    expect(memoryPageScript).not.toContain("./memoryViewModel");
    expect(memoryPageScript).toContain("function createMemoryPageData");
  });
});
