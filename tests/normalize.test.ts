import { describe, expect, it } from "vitest";

import { isNormalizedSpellingMatch, normalizeSpelling } from "../miniprogram/utils/normalize";

describe("normalize util", () => {
  it("trims leading and trailing spaces", () => {
    expect(normalizeSpelling("  projector  ")).toBe("projector");
  });

  it("lowercases spelling input", () => {
    expect(normalizeSpelling("ProJecTor")).toBe("projector");
  });

  it("treats casing differences as the same spelling", () => {
    expect(isNormalizedSpellingMatch("BLACKBOARD", "blackboard")).toBe(true);
  });

  it("treats leading and trailing spaces as the same spelling", () => {
    expect(isNormalizedSpellingMatch("  socket ", "socket")).toBe(true);
  });

  it("keeps different spellings different", () => {
    expect(isNormalizedSpellingMatch("projecter", "projector")).toBe(false);
  });

  it("does not collapse inner spaces in MVP spelling checks", () => {
    expect(isNormalizedSpellingMatch("trash  can", "trash can")).toBe(false);
  });
});
