type IAppOption = {
  globalData: Record<string, never>;
};

declare function App<T extends Record<string, unknown>>(options: T): void;
declare function Page<T extends Record<string, unknown>>(options: T): void;
