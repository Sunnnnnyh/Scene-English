import type {
  DailyLearningActivity,
  LearningActivityChartPoint,
  LearningActivityRange
} from "../types";
import { readStorage, type StorageAdapter, writeStorage } from "../utils/storage";

const ACTIVITY_DEFAULT: DailyLearningActivity[] = [];

const getTodayDateKey = (): string => new Date().toISOString().slice(0, 10);

const formatChartLabel = (dateKey: string): string => {
  const [, month, day] = dateKey.split("-");

  return `${Number(month)}/${Number(day)}`;
};

const createDateRange = (days: number): string[] => {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));

    return date.toISOString().slice(0, 10);
  });
};

export function getLearningActivity(adapter?: StorageAdapter): DailyLearningActivity[] {
  return readStorage("learningActivity", ACTIVITY_DEFAULT, adapter);
}

export function recordDailyLearnedWord(adapter?: StorageAdapter): DailyLearningActivity[] {
  const currentActivity = getLearningActivity(adapter);
  const todayDateKey = getTodayDateKey();
  const updatedAt = new Date().toISOString();
  const todayActivity = currentActivity.find((item) => item.date === todayDateKey);
  const nextActivity = todayActivity
    ? currentActivity.map((item) =>
        item.date === todayDateKey
          ? {
              ...item,
              learnedWordCount: item.learnedWordCount + 1,
              updatedAt
            }
          : item
      )
    : [
        ...currentActivity,
        {
          date: todayDateKey,
          learnedWordCount: 1,
          updatedAt
        }
      ];

  writeStorage("learningActivity", nextActivity, adapter);

  return nextActivity;
}

export function createLearningActivityChart(
  range: LearningActivityRange,
  adapter?: StorageAdapter
): LearningActivityChartPoint[] {
  const days = range === "week" ? 7 : 30;
  const activityByDate = new Map(
    getLearningActivity(adapter).map((item) => [item.date, item.learnedWordCount])
  );
  const dateRange = createDateRange(days);
  const maxValue = Math.max(...dateRange.map((date) => activityByDate.get(date) ?? 0), 0);

  return dateRange.map((date) => {
    const value = activityByDate.get(date) ?? 0;

    return {
      date,
      label: formatChartLabel(date),
      value,
      heightPercent: maxValue === 0 ? 0 : Math.round((value / maxValue) * 100)
    };
  });
}
