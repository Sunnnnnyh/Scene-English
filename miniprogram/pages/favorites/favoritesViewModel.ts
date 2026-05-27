import { getSceneById } from "../../services/sceneService";
import { getWordById } from "../../services/wordService";
import type { Favorite, Scene, Word } from "../../types";

export type FavoriteListItem = {
  wordId: Word["id"];
  en: Word["en"];
  cn: Word["cn"];
  phonetic: Word["phonetic"];
  audioUrl: Word["audioUrl"];
  expressionEn: Word["expressionEn"];
  expressionCn: Word["expressionCn"];
  sceneName: string;
  sceneId: Scene["id"];
  isExpanded: boolean;
};

export type FavoritesViewModel = {
  title: string;
  emptyTitle: string;
  isEmpty: boolean;
  favoriteItems: FavoriteListItem[];
};

export function createFavoritesViewModel(
  favorites: Favorite[],
  expandedWordIds: Word["id"][] = []
): FavoritesViewModel {
  const favoriteItems = favorites.flatMap((favorite) => {
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
        audioUrl: word.audioUrl,
        expressionEn: word.expressionEn,
        expressionCn: word.expressionCn,
        sceneName: scene.nameEn,
        sceneId: scene.id,
        isExpanded: expandedWordIds.includes(word.id)
      }
    ];
  });

  return {
    title: "Favorites",
    emptyTitle: "No favorite words yet",
    isEmpty: favoriteItems.length === 0,
    favoriteItems
  };
}
