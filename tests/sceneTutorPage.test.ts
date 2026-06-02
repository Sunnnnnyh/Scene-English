import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { scenes } from "../miniprogram/data/scenes";
import { classroomWords } from "../miniprogram/data/scenes";
import {
  createSceneTutorAskResultCard,
  createSceneViewModel,
  getSceneEntryAction
} from "../miniprogram/pages/scene/sceneViewModel";
import { sceneTutorCopy } from "../miniprogram/utils/sceneTutorCopy";
import type { Scene, SceneTutorAskResponse, UserProgress } from "../miniprogram/types";

function createEmptyProgress(sceneId: Scene["id"]): UserProgress {
  return {
    sceneId,
    learnedWordIds: [],
    completedMemoryCount: 0,
    completedWritingCount: 0,
    completedSpeakingCount: 0,
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function getStyleRule(styles: string, selector: string): string {
  const escapedSelector = selector.replaceAll(".", "\\.");
  return styles.match(new RegExp(`${escapedSelector} \\{[^}]+\\}`))?.[0] ?? "";
}

describe("Scene Tutor scene entry", () => {
  it("shows the Scene Tutor entry for available scenes", () => {
    const availableScenes = scenes.filter((scene) => scene.status === "available");

    expect(availableScenes.map((scene) => scene.id)).toEqual(["classroom", "lecture-hall"]);

    for (const scene of availableScenes) {
      const viewModel = createSceneViewModel(scene, createEmptyProgress(scene.id));

      expect(viewModel.sceneTutorEntry).toMatchObject({
        id: "sceneTutor",
        title: sceneTutorCopy.entryTitle,
        sceneTutorLabel: sceneTutorCopy.title,
        supportingText: sceneTutorCopy.entryDescription,
        actionLabel: "Open"
      });
      expect(viewModel.sceneTutorEntry?.capabilityLabels).toEqual([
        sceneTutorCopy.ask.title,
        sceneTutorCopy.make.title
      ]);
    }
  });

  it("does not expose the available Scene Tutor entry for coming-soon scenes", () => {
    const comingSoonScenes = scenes.filter((scene) => scene.status === "comingSoon");

    expect(comingSoonScenes.map((scene) => scene.id)).toEqual(["dormitory", "cafeteria"]);

    for (const scene of comingSoonScenes) {
      const viewModel = createSceneViewModel(scene, createEmptyProgress(scene.id));

      expect(viewModel.sceneTutorEntry).toBeNull();
    }
  });

  it("renders the Scene Tutor entry from view-model data without replacing learning modes", () => {
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );

    expect(sceneWxml).toContain('wx:if="{{sceneTutorEntry}}"');
    expect(sceneWxml).toContain('class="scene-tutor-entry"');
    expect(sceneWxml).toContain('data-entry-id="{{sceneTutorEntry.id}}"');
    expect(sceneWxml).toContain('bindtap="onEntryTap"');
    expect(sceneWxml).toContain("{{sceneTutorEntry.title}}");
    expect(sceneWxml).toContain("{{sceneTutorEntry.sceneTutorLabel}}");
    expect(sceneWxml).toContain("{{sceneTutorEntry.supportingText}}");
    expect(sceneWxml).toContain('wx:for="{{sceneTutorEntry.capabilityLabels}}"');
    expect(sceneWxml).toContain("{{item}}");
    expect(sceneWxml).toContain('wx:for="{{modeEntries}}"');
  });

  it("maps the Scene Tutor entry to an in-tab mode shell", () => {
    const classroom = scenes.find((scene) => scene.id === "classroom");
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );

    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const viewModel = createSceneViewModel(classroom, createEmptyProgress(classroom.id));

    expect(getSceneEntryAction("sceneTutor")).toEqual({
      type: "selectMode",
      mode: "sceneTutor"
    });
    expect(viewModel.sceneTutorPanel).toMatchObject({
      title: sceneTutorCopy.title,
      sceneNameLabel: `${classroom.nameEn} Scene`,
      emptyState: sceneTutorCopy.emptyState
    });
    expect(viewModel.sceneTutorPanel.actions).toEqual([
      {
        id: "ask",
        title: sceneTutorCopy.ask.title,
        supportingText: sceneTutorCopy.ask.homeSupportingText,
        actionLabel: sceneTutorCopy.ask.homeActionLabel
      },
      {
        id: "make",
        title: sceneTutorCopy.make.title,
        supportingText: sceneTutorCopy.make.homeSupportingText,
        actionLabel: sceneTutorCopy.make.homeActionLabel
      }
    ]);
    expect(sceneWxml).toContain("activeMode === 'sceneTutor'");
    expect(sceneWxml).toContain('class="scene-tutor-panel"');
    expect(sceneWxml).toContain("{{sceneTutorPanel.sceneNameLabel}}");
    expect(sceneWxml).toContain("{{sceneTutorPanel.title}}");
    expect(sceneWxml).toContain("{{sceneTutorPanel.emptyState}}");
    expect(sceneWxml).toContain('wx:for="{{sceneTutorPanel.actions}}"');
    expect(sceneWxml).toContain('wx:key="id"');
    expect(sceneWxml).toContain("{{item.title}}");
    expect(sceneWxml).toContain("{{item.supportingText}}");
    expect(sceneWxml).toContain("{{item.actionLabel}}");
  });

  it("styles Scene Tutor home as two full-width task cards", () => {
    const sceneWxss = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxss"),
      "utf8"
    );
    const actionsRule = getStyleRule(sceneWxss, ".scene-tutor-panel-actions");

    expect(sceneWxss).toContain(".scene-tutor-panel-actions");
    expect(actionsRule).toContain("display: flex;");
    expect(actionsRule).toContain("flex-direction: column;");
    expect(actionsRule).not.toContain("grid-template-columns: repeat(2");
    expect(sceneWxss).toContain(".scene-tutor-panel-action-copy");
    expect(sceneWxss).toContain(".scene-tutor-panel-action-label");
  });

  it("renders Ask AI input and recommended question chips for Step 5.1", () => {
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );
    const sceneTs = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.ts"), "utf8");
    const sceneWxss = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxss"),
      "utf8"
    );

    expect(sceneWxml).toContain("sceneTutorActiveTool === 'home'");
    expect(sceneWxml).toContain("sceneTutorActiveTool === 'ask'");
    expect(sceneWxml).toContain('data-scene-tutor-action-id="{{item.id}}"');
    expect(sceneWxml).toContain('bindtap="onSceneTutorActionTap"');
    expect(sceneWxml).toContain("{{sceneTutorAskInput}}");
    expect(sceneWxml).toContain("{{sceneTutorPanel.ask.inputPlaceholder}}");
    expect(sceneWxml).toContain('bindinput="onSceneTutorAskInput"');
    expect(sceneWxml).toContain('wx:for="{{sceneTutorPanel.ask.recommendedQuestions}}"');
    expect(sceneWxml).toContain('data-question="{{item}}"');
    expect(sceneWxml).toContain('bindtap="onSceneTutorRecommendedQuestionTap"');
    expect(sceneWxml).toContain("{{sceneTutorPanel.ask.sendLabel}}");
    expect(sceneWxml).toContain('disabled="{{!sceneTutorAskCanSubmit}}"');
    expect(sceneTs).toContain("onSceneTutorActionTap");
    expect(sceneTs).toContain("onSceneTutorAskInput");
    expect(sceneTs).toContain("onSceneTutorRecommendedQuestionTap");
    expect(sceneTs).toContain("sceneTutorAskCanSubmit");
    expect(sceneWxss).toContain(".scene-tutor-ask-panel");
    expect(sceneWxss).toContain(".scene-tutor-recommended-question");
  });

  it("keeps Ask AI panel separate from Make Sentences inputs", () => {
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );

    expect(sceneWxml).not.toContain("sceneTutorSelectedWordIds");
    expect(sceneWxml).not.toContain("sceneTutorPanel.make.generationTypes");
  });

  it("wires Ask AI submission to payload building and cloud request for Step 5.2", () => {
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );
    const sceneTs = readFileSync(join(process.cwd(), "miniprogram/pages/scene/scene.ts"), "utf8");

    expect(sceneTs).toContain("buildSceneTutorRequestPayload");
    expect(sceneTs).toContain("requestSceneTutor");
    expect(sceneTs).toContain('task: "ask"');
    expect(sceneTs).toContain('sceneTutorAskStatus: "loading"');
    expect(sceneTs).toContain('sceneTutorAskStatus: "success"');
    expect(sceneTs).toContain('sceneTutorAskStatus: "error"');
    expect(sceneTs).toContain("sceneTutorAskResult");
    expect(sceneTs).toContain("sceneTutorAskError");
    expect(sceneWxml).toContain("wx:if=\"{{sceneTutorAskStatus === 'loading'}}\"");
    expect(sceneWxml).toContain("{{sceneTutorPanel.loading}}");
    expect(sceneWxml).toContain('wx:if="{{sceneTutorAskError}}"');
    expect(sceneWxml).toContain("{{sceneTutorAskError}}");
    expect(sceneWxml).toContain("{{sceneTutorPanel.ask.retryLabel}}");
    expect(sceneWxml).toContain("{{sceneTutorAskResultCard.answer}}");
  });

  it("renders the structured Ask AI result card for Step 5.3", () => {
    const sceneWxml = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxml"),
      "utf8"
    );
    const sceneWxss = readFileSync(
      join(process.cwd(), "miniprogram/pages/scene/scene.wxss"),
      "utf8"
    );

    expect(sceneWxml).toContain("sceneTutorAskResultCard");
    expect(sceneWxml).toContain("Answer");
    expect(sceneWxml).toContain("Useful example");
    expect(sceneWxml).toContain("Related words");
    expect(sceneWxml).toContain("Based on");
    expect(sceneWxml).toContain("{{sceneTutorAskResultCard.answer}}");
    expect(sceneWxml).toContain("{{sceneTutorAskResultCard.example}}");
    expect(sceneWxml).toContain('wx:for="{{sceneTutorAskResultCard.relatedWords}}"');
    expect(sceneWxml).toContain('wx:for="{{sceneTutorAskResultCard.basedOn}}"');
    expect(sceneWxss).toContain(".scene-tutor-ask-result-card");
    expect(sceneWxss).toContain(".scene-tutor-ask-result-source");
  });

  it("maps Ask AI result sources to readable words and falls back to the current scene", () => {
    const classroom = scenes.find((scene) => scene.id === "classroom");

    if (!classroom) {
      throw new Error("Classroom scene fixture is missing");
    }

    const result: SceneTutorAskResponse = {
      type: "ask",
      answer: "A projector shows slides on a screen.",
      example: "The projector needs to be adjusted before class.",
      relatedWords: ["projector", "whiteboard"],
      basedOn: []
    };

    expect(createSceneTutorAskResultCard(result, classroom, classroomWords)).toEqual({
      answer: result.answer,
      example: result.example,
      relatedWords: ["projector", "whiteboard"],
      basedOn: ["Classroom Scene"]
    });
  });
});
