import type { Scene } from "../types";

export const scenes: Scene[] = [
  {
    id: "classroom",
    nameCn: "教室",
    nameEn: "Classroom",
    coverImage: "/assets/images/classroom-cover.png",
    sceneImage: "/assets/images/classroom.png",
    baseWidth: 1920,
    baseHeight: 1080,
    wordCount: 20,
    status: "available"
  },
  {
    id: "lecture-hall",
    nameCn: "阶梯教室",
    nameEn: "Lecture Hall",
    coverImage: "/assets/images/lecture-hall-cover.png",
    sceneImage: "/assets/images/lecture-hall.png",
    baseWidth: 1920,
    baseHeight: 1080,
    wordCount: 0,
    status: "comingSoon"
  },
  {
    id: "dormitory",
    nameCn: "宿舍",
    nameEn: "Dormitory",
    coverImage: "/assets/images/dormitory-cover.png",
    sceneImage: "/assets/images/dormitory.png",
    baseWidth: 1920,
    baseHeight: 1080,
    wordCount: 0,
    status: "comingSoon"
  },
  {
    id: "cafeteria",
    nameCn: "食堂",
    nameEn: "Cafeteria",
    coverImage: "/assets/images/cafeteria-cover.png",
    sceneImage: "/assets/images/cafeteria.png",
    baseWidth: 1920,
    baseHeight: 1080,
    wordCount: 0,
    status: "comingSoon"
  }
];

export const availableScenes = scenes.filter((scene) => scene.status === "available");

export const comingSoonScenes = scenes.filter((scene) => scene.status === "comingSoon");
