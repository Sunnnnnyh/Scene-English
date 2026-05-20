import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createFavoritesViewModel } from "../miniprogram/pages/favorites/favoritesViewModel";
import { getWordById } from "../miniprogram/services/wordService";
import type { Favorite } from "../miniprogram/types";

const favoritesScript = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/favorites/favorites.ts", import.meta.url)),
  "utf8"
);
const favoritesMarkup = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/favorites/favorites.wxml", import.meta.url)),
  "utf8"
);
const favoritesStyles = readFileSync(
  fileURLToPath(new URL("../miniprogram/pages/favorites/favorites.wxss", import.meta.url)),
  "utf8"
);

const favoriteRecords: Favorite[] = [
  {
    wordId: "projector",
    sceneId: "classroom",
    createdAt: "2026-05-18T10:00:00.000Z"
  },
  {
    wordId: "podium",
    sceneId: "classroom",
    createdAt: "2026-05-18T10:05:00.000Z"
  }
];
const projector = getWordById("projector");
const podium = getWordById("podium");

describe("favorites page", () => {
  it("builds a list view model from favorite records", () => {
    if (!projector || !podium) {
      throw new Error("Favorite word fixtures are missing");
    }

    expect(createFavoritesViewModel(favoriteRecords, ["projector", "podium"])).toEqual({
      title: "Favorites",
      subtitle: "Review the words you marked for later.",
      emptyTitle: "No favorite words yet",
      emptyDescription: "Go back to Memory mode and tap the star on a word card to save it.",
      isEmpty: false,
      favoriteItems: [
        {
          wordId: "projector",
          en: "projector",
          cn: projector.cn,
          sceneName: "Classroom",
          sceneId: "classroom",
          phonetic: projector.phonetic,
          expressionEn: projector.expressionEn,
          expressionCn: projector.expressionCn,
          isExpanded: true
        },
        {
          wordId: "podium",
          en: "podium",
          cn: podium.cn,
          sceneName: "Classroom",
          sceneId: "classroom",
          phonetic: podium.phonetic,
          expressionEn: podium.expressionEn,
          expressionCn: podium.expressionCn,
          isExpanded: true
        }
      ]
    });
  });

  it("builds an empty state when nothing has been favorited", () => {
    const viewModel = createFavoritesViewModel([]);

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.favoriteItems).toEqual([]);
  });

  it("renders a real favorite list and empty state instead of a placeholder page", () => {
    expect(favoritesMarkup).toContain("favorites-page");
    expect(favoritesMarkup).toContain("favoriteItems");
    expect(favoritesMarkup).toContain('wx:for="{{favoriteItems}}"');
    expect(favoritesMarkup).toContain("{{item.en}}");
    expect(favoritesMarkup).toContain("{{item.cn}}");
    expect(favoritesMarkup).toContain("{{item.sceneName}}");
    expect(favoritesMarkup).toContain('data-word-id="{{item.wordId}}"');
    expect(favoritesMarkup).toContain('bindtap="onToggleFavoriteDetail"');
    expect(favoritesMarkup).toContain("{{item.phonetic}}");
    expect(favoritesMarkup).toContain("{{item.expressionEn}}");
    expect(favoritesMarkup).toContain("{{item.expressionCn}}");
    expect(favoritesMarkup).toContain('wx:if="{{item.isExpanded}}"');
    expect(favoritesMarkup).toContain('wx:if="{{isEmpty}}"');
    expect(favoritesMarkup).toContain("favorite-empty");
    expect(favoritesMarkup).not.toContain("placeholder-page");
    expect(favoritesMarkup).not.toContain("Favorites placeholder page");
    expect(favoritesMarkup).not.toContain("Example");
    expect(favoritesMarkup).not.toContain("exampleEn");
    expect(favoritesMarkup).not.toContain("exampleCn");
  });

  it("refreshes favorites from local storage whenever the page is shown", () => {
    expect(favoritesScript).toContain("getFavorites");
    expect(favoritesScript).toContain("getWordById");
    expect(favoritesScript).toContain("getSceneById");
    expect(favoritesScript).toContain("selectedFavoriteWordIds");
    expect(favoritesScript).toContain("onToggleFavoriteDetail");
    expect(favoritesScript).toContain("onShow");
    expect(favoritesScript).toContain("setData");
    expect(favoritesScript).not.toContain("./favoritesViewModel");
  });

  it("styles list rows and the empty state", () => {
    expect(favoritesStyles).toContain(".favorites-page");
    expect(favoritesStyles).toContain(".favorites-list");
    expect(favoritesStyles).toContain(".favorite-item");
    expect(favoritesStyles).toContain(".favorite-word");
    expect(favoritesStyles).toContain(".favorite-scene");
    expect(favoritesStyles).toContain(".favorite-detail");
    expect(favoritesStyles).toContain(".favorite-phonetic");
    expect(favoritesStyles).toContain(".favorite-expression");
    expect(favoritesStyles).toContain(".favorite-empty");
  });
});
