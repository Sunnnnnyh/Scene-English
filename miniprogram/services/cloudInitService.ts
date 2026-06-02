type CloudInitOptions = {
  traceUser: boolean;
};

type CloudAdapter = {
  init(options: CloudInitOptions): void;
};

type WxCloudAdapter = {
  cloud?: CloudAdapter;
};

export type CloudInitResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "cloud_unavailable";
    };

export function initializeCloudCapability(wxAdapter: WxCloudAdapter): CloudInitResult {
  if (!wxAdapter.cloud) {
    return {
      ok: false,
      reason: "cloud_unavailable"
    };
  }

  try {
    wxAdapter.cloud.init({
      traceUser: true
    });

    return {
      ok: true
    };
  } catch {
    return {
      ok: false,
      reason: "cloud_unavailable"
    };
  }
}
