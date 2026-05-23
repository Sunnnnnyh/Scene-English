import { getSceneById } from "../../services/sceneService";
import { getWordById } from "../../services/wordService";
import type { MasteryProgress, Mistake, MistakeType, Scene, Word } from "../../types";

const mistakeTypeLabels: Record<MistakeType, string> = {
  click: "Object",
  spelling: "Spelling",
  speaking: "Speaking"
};

const mistakeTypeOrder: MistakeType[] = ["click", "spelling", "speaking"];

export type MistakeTypeItem = {
  type: MistakeType;
  label: string;
  mistakeCount: number;
  masteryProgress: MasteryProgress;
  progressLabel: string;
  lastMistakeAt: string;
};

export type MistakeListItem = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  sceneName: string;
  sceneId: Scene["id"];
  lastMistakeAt: string;
  totalMistakeCount: number;
  typeItems: MistakeTypeItem[];
};

export type MistakesViewModel = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  isEmpty: boolean;
  mistakeItems: MistakeListItem[];
};

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

export function createMistakesViewModel(mistakes: Mistake[]): MistakesViewModel {
  const mistakeItems = mistakes
    .flatMap((mistake) => {
      const word = getWordById(mistake.wordId);
      const scene = getSceneById(mistake.sceneId);

      if (!word || !scene) {
        return [];
      }

      const typeItems = createMistakeTypeItems(mistake);

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

  return {
    title: "Mistakes",
    subtitle: "Review weak words by mistake type.",
    emptyTitle: "No mistakes yet",
    emptyDescription: "Mistakes from practice will appear here after a wrong answer.",
    isEmpty: mistakeItems.length === 0,
    mistakeItems
  };
}
