export interface Achievement {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    requiredCriteria: string; // JSON string
    points: number;
    createdAt: string;
}

export interface StudentAchievement {
    achievementId: string;
    name: string;
    description: string;
    iconUrl: string;
    points: number;
    earnedAt: string;
    isNew: boolean;
}

