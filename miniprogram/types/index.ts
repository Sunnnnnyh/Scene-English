export type SceneStatus = "available" | "comingSoon";

export type StudyMode = "memory" | "listeningWriting" | "listeningSpeaking";

export type MistakeType = "click" | "spelling" | "speaking";

export type SpeechProvider = "mock" | "asr";

export type MasteryProgress = 0 | 50 | 100;

export type StorageEntity = "favorites" | "mistakes" | "progress" | "settings" | "onboarding";

export type SceneEnglishStorageKey = `sceneenglish:${StorageEntity}`;

export type ISODateString = string;

export type AssetPath = `/${string}`;

export type HotspotPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Scene = {
  id: string;
  nameCn: string;
  nameEn: string;
  coverImage: AssetPath;
  sceneImage: AssetPath;
  baseWidth: number;
  baseHeight: number;
  wordCount: number;
  status: SceneStatus;
};

export type Word = {
  id: string;
  sceneId: Scene["id"];
  cn: string;
  en: string;
  phonetic: string;
  exampleEn: string;
  exampleCn: string;
  expressionEn: string;
  expressionCn: string;
  audioUrl: AssetPath;
  position: HotspotPosition;
};

export type UserProgress = {
  sceneId: Scene["id"];
  learnedWordIds: Word["id"][];
  completedMemoryCount: number;
  completedWritingCount: number;
  completedSpeakingCount: number;
  updatedAt: ISODateString;
};

export type Favorite = {
  wordId: Word["id"];
  sceneId: Scene["id"];
  createdAt: ISODateString;
};

export type MistakeTypeStats = {
  mistakeCount: number;
  correctStreak: number;
  masteryProgress: MasteryProgress;
  lastMistakeAt: ISODateString;
};

export type MistakeTypeStatsMap = Partial<Record<MistakeType, MistakeTypeStats>>;

export type Mistake = {
  wordId: Word["id"];
  sceneId: Scene["id"];
  typeStats: MistakeTypeStatsMap;
  lastMistakeAt: ISODateString;
};

export type QuizQuestion = {
  id: string;
  sceneId: Scene["id"];
  wordId: Word["id"];
  mode: Exclude<StudyMode, "memory">;
  targetMistakeType?: MistakeType;
};

export type QuizRound = {
  id: string;
  sceneId: Scene["id"];
  mode: Exclude<StudyMode, "memory">;
  questions: QuizQuestion[];
  currentIndex: number;
  startedAt: ISODateString;
};

export type QuizAnswerResult = {
  questionId: QuizQuestion["id"];
  wordId: Word["id"];
  mistakeType?: MistakeType;
  isCorrect: boolean;
  attempt: number;
  answeredAt: ISODateString;
};

export type SpeechResult = {
  transcript: string;
  passed: boolean;
  provider: SpeechProvider;
  confidence?: number;
};

export type LocalStore<T> = {
  version: number;
  updatedAt: ISODateString;
  data: T;
};

export type OnboardingState = {
  memoryGuideCompleted: boolean;
  updatedAt: ISODateString;
};
