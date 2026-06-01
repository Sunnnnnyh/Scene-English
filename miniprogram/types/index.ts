export type SceneStatus = "available" | "comingSoon";

export type StudyMode = "memory" | "listeningWriting" | "listeningSpeaking";

export type MistakeType = "click" | "spelling" | "speaking";

export type SpeechProvider = "mock" | "asr";

export type MasteryProgress = 0 | 50 | 100;

export type SceneTutorTask =
  | "ask"
  | "generate_sentence"
  | "generate_paragraph"
  | "generate_dialogue";

export type StorageEntity =
  | "favorites"
  | "mistakes"
  | "progress"
  | "settings"
  | "onboarding"
  | "profile"
  | "learningActivity";

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
  positions?: HotspotPosition[];
};

export type UserProgress = {
  sceneId: Scene["id"];
  learnedWordIds: Word["id"][];
  completedMemoryCount: number;
  completedWritingCount: number;
  completedSpeakingCount: number;
  updatedAt: ISODateString;
};

export type UserProfile = {
  nickname: string;
  signature: string;
  avatarText: string;
  avatarUrl: string;
  updatedAt: ISODateString;
};

export type LearningActivityRange = "week" | "month";

export type DailyLearningActivity = {
  date: string;
  learnedWordCount: number;
  updatedAt: ISODateString;
};

export type LearningActivityChartPoint = {
  date: string;
  label: string;
  value: number;
  heightPercent: number;
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

export type SceneTutorMatchedWord = {
  id: Word["id"];
  sceneId: Scene["id"];
  en: Word["en"];
  cn: Word["cn"];
  phonetic: Word["phonetic"];
  expressionEn: Word["expressionEn"];
  expressionCn: Word["expressionCn"];
  isFavorite: boolean;
  mistakeTypes: MistakeType[];
  isLearned: boolean;
};

export type SceneTutorLearningSignals = {
  favoriteWordIds: Word["id"][];
  mistakeWordIds: Word["id"][];
  learnedWordIds: Word["id"][];
  learnedCount: number;
  totalWordCount: number;
};

export type SceneTutorContext = {
  scene: Pick<Scene, "id" | "nameEn" | "nameCn" | "wordCount">;
  task: SceneTutorTask;
  query: string;
  selectedWordIds: Word["id"][];
  matchedWords: SceneTutorMatchedWord[];
  learningSignals: SceneTutorLearningSignals;
};

export type SceneTutorRequestPayload = {
  task: SceneTutorTask;
  context: SceneTutorContext;
};

export type SceneTutorAskResponse = {
  type: "ask";
  answer: string;
  example: string;
  relatedWords: string[];
  basedOn: string[];
};

export type SceneTutorMakeSentencesResponse = {
  type: Exclude<SceneTutorTask, "ask">;
  generatedText: string;
  keyWordsUsed: string[];
  chineseHelp: string;
  trySaying: string;
};

export type SceneTutorResponse = SceneTutorAskResponse | SceneTutorMakeSentencesResponse;

export type SceneTutorErrorCode =
  | "unavailable"
  | "invalid_request"
  | "out_of_scope"
  | "model_timeout"
  | "model_response_invalid";

export type SceneTutorUnavailableResult = {
  ok: false;
  errorCode: Extract<SceneTutorErrorCode, "unavailable">;
  message: string;
};

export type SceneTutorLearningSignalsResult =
  | {
      ok: true;
      scene: Pick<Scene, "id" | "nameEn" | "nameCn" | "wordCount">;
      signals: SceneTutorLearningSignals;
    }
  | SceneTutorUnavailableResult;

export type SceneTutorBaseContextInput = {
  sceneId: Scene["id"];
  task: SceneTutorTask;
  query: string;
  selectedWordIds?: Word["id"][];
};

export type SceneTutorBaseContextResult =
  | {
      ok: true;
      context: SceneTutorContext;
    }
  | SceneTutorUnavailableResult;

export type SceneTutorRetrievalInput = {
  sceneId: Scene["id"];
  query: string;
  selectedWordIds?: Word["id"][];
  learningSignals: SceneTutorLearningSignals;
};

export type SceneTutorRetrievalResult =
  | {
      ok: true;
      matchedWords: SceneTutorMatchedWord[];
    }
  | SceneTutorUnavailableResult;

export type SceneTutorPayloadInput = {
  sceneId: Scene["id"];
  task: SceneTutorTask;
  query: string;
  selectedWordIds?: Word["id"][];
};

export type SceneTutorPayloadResult =
  | {
      ok: true;
      payload: SceneTutorRequestPayload;
    }
  | SceneTutorUnavailableResult;

export type LocalStore<T> = {
  version: number;
  updatedAt: ISODateString;
  data: T;
};

export type OnboardingState = {
  memoryGuideCompleted: boolean;
  memoryTranslationGuideCompleted: boolean;
  updatedAt: ISODateString;
};
