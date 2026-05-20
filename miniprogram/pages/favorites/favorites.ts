import { getFavorites } from "../../services/favoriteService";
import { getSceneById } from "../../services/sceneService";
import { getWordById } from "../../services/wordService";
import type { Favorite, Scene, Word } from "../../types";

type FavoriteListItem = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  phonetic: Word["phonetic"];
  expressionEn: Word["expressionEn"];
  expressionCn: Word["expressionCn"];
  sceneName: string;
  sceneId: Scene["id"];
  isExpanded: boolean;
};

type FavoriteDetailTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: string;
    };
  };
};

function createFavoriteItems(
  favorites: Favorite[],
  selectedFavoriteWordIds: string[]
): FavoriteListItem[] {
  return favorites.flatMap((favorite) => {
    const word = getWordById(favorite.wordId);
    const scene = getSceneById(favorite.sceneId);

    if (!word || !scene) {
      return [];
    }

    return [
      {
        wordId: word.id,
        en: word.en,
        cn: word.cn,
        phonetic: word.phonetic,
        expressionEn: word.expressionEn,
        expressionCn: word.expressionCn,
        sceneName: scene.nameEn,
        sceneId: scene.id,
        isExpanded: selectedFavoriteWordIds.includes(word.id)
      }
    ];
  });
}

function createPageData(selectedFavoriteWordIds: string[] = []) {
  const favoriteItems = createFavoriteItems(getFavorites(), selectedFavoriteWordIds);

  return {
    title: "Favorites",
    subtitle: "Review the words you marked for later.",
    emptyTitle: "No favorite words yet",
    emptyDescription: "Go back to Memory mode and tap the star on a word card to save it.",
    selectedFavoriteWordIds,
    isEmpty: favoriteItems.length === 0,
    favoriteItems
  };
}

Page({
  data: createPageData(),

  onShow() {
    const selectedFavoriteWordIds = this.data.selectedFavoriteWordIds ?? [];

    this.setData(createPageData(selectedFavoriteWordIds));
  },

  onToggleFavoriteDetail(event: FavoriteDetailTapEvent) {
    const { wordId } = event.currentTarget.dataset;

    if (!wordId) {
      return;
    }

    const selectedFavoriteWordIds = this.data.selectedFavoriteWordIds ?? [];
    const nextSelectedFavoriteWordIds = selectedFavoriteWordIds.includes(wordId)
      ? selectedFavoriteWordIds.filter((selectedWordId: string) => selectedWordId !== wordId)
      : [...selectedFavoriteWordIds, wordId];

    this.setData(createPageData(nextSelectedFavoriteWordIds));
  }
});
