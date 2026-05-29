import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const feedbackCopyPath = join(process.cwd(), "miniprogram/utils/feedbackCopy.ts");
const feedbackCopyScript = existsSync(feedbackCopyPath)
  ? readFileSync(feedbackCopyPath, "utf8")
  : "";
const scenePageScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/scene/scene.ts"),
  "utf8"
);
const sceneMarkup = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.wxml"), "utf8");
const indexViewModelScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/index/indexViewModel.ts"),
  "utf8"
);
const mistakesPageScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/mistakes/mistakes.ts"),
  "utf8"
);
const favoritesPageScript = readFileSync(
  join(process.cwd(), "miniprogram/pages/favorites/favorites.ts"),
  "utf8"
);

describe("unified user-facing feedback copy", () => {
  it("keeps core feedback strings in one shared module", () => {
    expect(feedbackCopyScript).toContain("export const feedbackCopy");
    expect(feedbackCopyScript).toContain("audioUnavailable");
    expect(feedbackCopyScript).toContain("sceneImageUnavailable");
    expect(feedbackCopyScript).toContain("comingSoon");
    expect(feedbackCopyScript).toContain("listenFirst");
    expect(feedbackCopyScript).toContain("tapObject");
    expect(feedbackCopyScript).toContain("tryAgain");
    expect(feedbackCopyScript).toContain("microphonePermission");
    expect(feedbackCopyScript).toContain("recordingTooShort");
    expect(feedbackCopyScript).toContain("recognitionFailed");
    expect(feedbackCopyScript).toContain("speechStatusReady");
  });

  it("uses shared feedback copy from the main user-facing pages", () => {
    expect(scenePageScript).toContain('import { feedbackCopy } from "../../utils/feedbackCopy"');
    expect(indexViewModelScript).toContain(
      'import { feedbackCopy } from "../../utils/feedbackCopy"'
    );
    expect(mistakesPageScript).toContain('import { feedbackCopy } from "../../utils/feedbackCopy"');
    expect(favoritesPageScript).toContain(
      'import { feedbackCopy } from "../../utils/feedbackCopy"'
    );
  });

  it("does not expose implementation or technical wording in visible feedback", () => {
    const userFacingSources = [
      scenePageScript,
      sceneMarkup,
      indexViewModelScript,
      mistakesPageScript,
      favoritesPageScript
    ].join("\n");

    expect(userFacingSources).not.toContain("Mock ASR enabled");
    expect(userFacingSources).not.toContain("Speaking practice coming soon");
    expect(userFacingSources).not.toContain("Scene image could not load.");
    expect(userFacingSources).not.toContain("Recording failed. Please try again.");
    expect(userFacingSources).not.toContain("Recording was too short. Please try again.");
    expect(userFacingSources).not.toContain(
      "Microphone permission is needed to practice speaking."
    );
    expect(userFacingSources).not.toContain("I could not check that recording. Please try again.");
    expect(userFacingSources).not.toContain("I could not hear the word clearly. Please try again.");
    expect(userFacingSources.toLowerCase()).not.toContain("mock");
  });

  it("keeps object-tap feedback descriptive", () => {
    expect(feedbackCopyScript).toContain('tapObject: "Tap an object in the picture."');
  });
});
