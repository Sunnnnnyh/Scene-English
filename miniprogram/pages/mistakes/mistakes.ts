import { getMistakes, removeMistake } from "../../services/mistakeService";
import { savePendingMistakePracticeRequest } from "../../services/mistakePracticeService";
import { getSceneById } from "../../services/sceneService";
import { getWordById } from "../../services/wordService";
import type { MasteryProgress, Mistake, MistakeType, Scene, Word } from "../../types";

type MistakeTypeItem = {
  type: MistakeType;
  label: string;
  mistakeCount: number;
  masteryProgress: MasteryProgress;
  progressLabel: string;
  lastMistakeAt: string;
};

type MistakeListItem = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  sceneName: string;
  sceneId: Scene["id"];
  lastMistakeAt: string;
  totalMistakeCount: number;
  typeItems: MistakeTypeItem[];
};

type MistakeTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: Word["id"];
    };
  };
};

const mistakeTypeLabels: Record<MistakeType, string> = {
  click: "Object",
  spelling: "Spelling",
  speaking: "Speaking"
};

const mistakeTypeOrder: MistakeType[] = ["click", "spelling", "speaking"];
const practiceTypes: MistakeType[] = ["click", "spelling"];

function isMistakeType(value: unknown): value is MistakeType {
  return value === "click" || value === "spelling" || value === "speaking";
}

function hasPracticeMistakes(mistakeType: MistakeType): boolean {
  return getMistakes().some(
    (mistake) => mistake.sceneId === "classroom" && Boolean(mistake.typeStats[mistakeType])
  );
}

function formatMistakeDate(value: string): string {
  return value.split("T")[0] || value;
}

function createMistakeTypeItems(mistake: Mistake): MistakeTypeItem[] {
  return mistakeTypeOrder.flatMap((type) => {
    const stats = mistake.typeStats[type];

    if (!stats) {
      return [];
    }

    return [
      {
        type,
        label: mistakeTypeLabels[type],
        mistakeCount: stats.mistakeCount,
        masteryProgress: stats.masteryProgress,
        progressLabel: `${stats.masteryProgress}%`,
        lastMistakeAt: formatMistakeDate(stats.lastMistakeAt)
      }
    ];
  });
}

function createMistakeItems(mistakes: Mistake[]): MistakeListItem[] {
  return mistakes
    .flatMap((mistake) => {
      const word = getWordById(mistake.wordId);
      const scene = getSceneById(mistake.sceneId);

      if (!word || !scene) {
        return [];
      }

      const typeItems = createMistakeTypeItems(mistake);

      if (typeItems.length === 0) {
        return [];
      }

      return [
        {
          wordId: word.id,
          en: word.en,
          cn: word.cn,
          sceneName: scene.nameEn,
          sceneId: scene.id,
          lastMistakeAt: formatMistakeDate(mistake.lastMistakeAt),
          totalMistakeCount: typeItems.reduce((total, item) => total + item.mistakeCount, 0),
          typeItems
        }
      ];
    })
    .sort((left, right) => right.totalMistakeCount - left.totalMistakeCount);
}

function createPageData() {
  const mistakeItems = createMistakeItems(getMistakes());

  return {
    title: "Mistakes",
    subtitle: "Review weak words by mistake type.",
    emptyTitle: "No mistakes yet",
    emptyDescription: "Mistakes from practice will appear here after a wrong answer.",
    isEmpty: mistakeItems.length === 0,
    mistakeItems
  };
}

Page({
  data: createPageData(),

  onShow() {
    this.setData(createPageData());
  },

  onRemoveMistake(event: MistakeTapEvent) {
    const { wordId } = event.currentTarget.dataset;

    if (!wordId) {
      return;
    }

    wx.showModal({
      title: "Remove this mistake?",
      content: "This word will leave your mistake list.",
      confirmText: "Remove",
      confirmColor: "#c95445",
      success: (result) => {
        if (!result.confirm) {
          return;
        }

        removeMistake(wordId);
        this.setData(createPageData());
      }
    });
  },

  onPracticeMistakes() {
    wx.showActionSheet({
      itemList: ["Object", "Spelling"],
      success: (result) => {
        const mistakeType = practiceTypes[result.tapIndex];

        if (!isMistakeType(mistakeType)) {
          return;
        }

        if (!hasPracticeMistakes(mistakeType)) {
          wx.showToast({
            title: `No ${mistakeTypeLabels[mistakeType]} mistakes`,
            icon: "none"
          });
          return;
        }

        savePendingMistakePracticeRequest({
          sceneId: "classroom",
          mistakeType
        });
        wx.switchTab({ url: "/pages/scene/scene" });
      }
    });
  }
});
