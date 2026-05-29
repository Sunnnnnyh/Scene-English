import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("Me dashboard page", () => {
  it("renders profile editing, learning chart controls, and common entry links", () => {
    const wxml = readSource("miniprogram/pages/me/me.wxml");

    expect(wxml).toContain("profile");
    expect(wxml).not.toContain("{{title}}");
    expect(wxml).toContain('bindtap="onStartEditProfile"');
    expect(wxml).toContain('open-type="chooseAvatar"');
    expect(wxml).toContain('bind:chooseavatar="onChooseAvatar"');
    expect(wxml).not.toContain('bindtap="onTapAvatar"');
    expect(wxml).not.toContain("binderror");
    expect(wxml).toContain('bindinput="onNicknameInput"');
    expect(wxml).toContain('bindinput="onSignatureInput"');
    expect(wxml).not.toContain("onAvatarTextInput");
    expect(wxml).not.toContain("头像字母");
    expect(wxml).toContain("chartTabs");
    expect(wxml).toContain("activityChart");
    expect(wxml).toContain("quickEntries");
    expect(wxml).toContain("onTapQuickEntry");
  });

  it("does not show the old speech recognition status card", () => {
    const wxml = readSource("miniprogram/pages/me/me.wxml");
    const ts = readSource("miniprogram/pages/me/me.ts");
    const viewModel = readSource("miniprogram/pages/me/meViewModel.ts");

    expect(`${wxml}\n${ts}\n${viewModel}`).not.toMatch(/asrStatus|口语识别|Speech practice ready/);
  });

  it("keeps dashboard cards compact on narrow phones", () => {
    const wxss = readSource("miniprogram/pages/me/me.wxss");

    expect(wxss).toContain("@media (max-width: 360px)");
    expect(wxss).toContain(".chart-bar");
    expect(wxss).toContain(".quick-entry");
    expect(wxss).toContain(".profile-avatar");
  });

  it("uses a layout-neutral WeChat avatar picker and view-based dashboard controls", () => {
    const wxml = readSource("miniprogram/pages/me/me.wxml");
    const ts = readSource("miniprogram/pages/me/me.ts");
    const wxss = readSource("miniprogram/pages/me/me.wxss");
    const buttonMatches = wxml.match(/<button/g) ?? [];

    expect(buttonMatches).toHaveLength(1);
    expect(wxml).toContain('class="profile-avatar-shell"');
    expect(wxml).toContain('class="profile-avatar-picker"');
    expect(ts).toContain("onChooseAvatar");
    expect(ts).not.toContain("onTapAvatar");
    expect(ts).not.toContain("onChooseAvatarError");
    expect(ts).not.toContain("wx.chooseMedia");
    expect(wxss).toMatch(/\.profile-avatar-shell[\s\S]*width: 112rpx;[\s\S]*height: 112rpx;/);
    expect(wxss).toMatch(/\.profile-avatar-picker[\s\S]*position: absolute;[\s\S]*opacity: 0;/);
    expect(wxss).toMatch(/\.profile-edit \{[\s\S]*width: 88rpx;[\s\S]*\}/);
    expect(wxss).toMatch(/\.chart-tab \{[\s\S]*width: 76rpx;[\s\S]*\}/);
    expect(wxss).toMatch(/\.quick-entry \{[\s\S]*width: 100%;[\s\S]*\}/);
  });
});
