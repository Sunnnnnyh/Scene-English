import { getFavorites, removeFavorite } from "../../services/favoriteService";
import { getSceneById } from "../../services/sceneService";
import { getWordById } from "../../services/wordService";
import type { Favorite, Scene, Word } from "../../types";

type FavoriteListItem = {
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

type FavoriteDetailTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      wordId?: string;
    };
  };
};

type FavoriteAudioTapEvent = WechatMiniprogram.BaseEvent & {
  currentTarget: {
    dataset: {
      audioUrl?: Word["audioUrl"];
    };
  };
};

let favoriteAudioContext: WechatMiniprogram.InnerAudioContext | undefined;

function stopFavoriteAudio() {
  if (!favoriteAudioContext) {
    return;
  }

  try {
    favoriteAudioContext.stop();
  } catch {
    // Best-effort cleanup; playback errors are surfaced from play callbacks.
  }
}

function releaseFavoriteAudio() {
  if (!favoriteAudioContext) {
    return;
  }

  stopFavoriteAudio();

  try {
    favoriteAudioContext.destroy();
  } catch {
    // Best-effort cleanup when a new favorite audio starts or the page leaves.
  }

  favoriteAudioContext = undefined;
}

function playFavoriteAudio(src: Word["audioUrl"], onError: () => void) {
  releaseFavoriteAudio();

  try {
    const audioContext = wx.createInnerAudioContext();
    favoriteAudioContext = audioContext;
    audioContext.src = src;
    audioContext.onError(onError);
    audioContext.play();
  } catch {
    onError();
  }
}

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
        audioUrl: word.audioUrl,
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
  },

  onPlayFavoriteAudio(event: FavoriteAudioTapEvent) {
    const { audioUrl } = event.currentTarget.dataset;

    if (!audioUrl) {
      return;
    }

    playFavoriteAudio(audioUrl, () => {
      wx.showToast({
        title: "音频暂时无法播放",
        icon: "none"
      });
    });
  },

  onRemoveFavorite(event: FavoriteDetailTapEvent) {
    const { wordId } = event.currentTarget.dataset;

    if (!wordId) {
      return;
    }

    stopFavoriteAudio();
    removeFavorite(wordId);

    const selectedFavoriteWordIds = (this.data.selectedFavoriteWordIds ?? []).filter(
      (selectedWordId: string) => selectedWordId !== wordId
    );

    this.setData(createPageData(selectedFavoriteWordIds));
  },

  onHide() {
    stopFavoriteAudio();
  },

  onUnload() {
    releaseFavoriteAudio();
  }
});
