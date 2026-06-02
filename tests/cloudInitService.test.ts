import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

import { initializeCloudCapability } from "../miniprogram/services/cloudInitService";

describe("cloudInitService", () => {
  it("initializes wx.cloud when cloud capability is available", () => {
    const init = vi.fn();

    expect(
      initializeCloudCapability({
        cloud: {
          init
        }
      })
    ).toEqual({
      ok: true
    });
    expect(init).toHaveBeenCalledWith({
      traceUser: true
    });
  });

  it("returns unavailable when wx.cloud is missing", () => {
    expect(initializeCloudCapability({})).toEqual({
      ok: false,
      reason: "cloud_unavailable"
    });
  });

  it("returns unavailable when cloud init throws", () => {
    const init = vi.fn(() => {
      throw new Error("cloud init failed");
    });

    expect(
      initializeCloudCapability({
        cloud: {
          init
        }
      })
    ).toEqual({
      ok: false,
      reason: "cloud_unavailable"
    });
  });

  it("wires cloud initialization into the mini program app launch", () => {
    const appSource = readFileSync("miniprogram/app.ts", "utf8");

    expect(appSource).toContain(
      'import { initializeCloudCapability } from "./services/cloudInitService";'
    );
    expect(appSource).toContain("onLaunch()");
    expect(appSource).toContain("initializeCloudCapability(wx)");
    expect(appSource).toContain("this.globalData.isCloudAvailable = cloudInitResult.ok");
  });
});
