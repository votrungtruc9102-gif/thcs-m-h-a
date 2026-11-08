import { ExerciseMovementGroup } from '../types';

/**
 * Normalizes answer string for fair, flexible matching:
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses consecutive spaces
 * - Normalizes punctuation (removes trailing periods, commas, quotes)
 */
export function normalizeAnswer(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance calculation for minor typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Checks a short answer against primary answer and accepted synonym list.
 * Accepts exact match (normalized) or typo-tolerant match (distance <= 1 for length >= 5).
 */
export function checkTextAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptedAnswers: string[] = []
): { isCorrect: boolean; matchedWith?: string } {
  const cleanUser = normalizeAnswer(userAnswer);
  if (!cleanUser) return { isCorrect: false };

  const allCandidates = [correctAnswer, ...acceptedAnswers].filter(Boolean);

  for (const candidate of allCandidates) {
    const cleanCandidate = normalizeAnswer(candidate);
    if (!cleanCandidate) continue;

    // Exact normalized match
    if (cleanUser === cleanCandidate) {
      return { isCorrect: true, matchedWith: candidate };
    }

    // Direct containment for longer descriptive answers
    if (cleanCandidate.length >= 8 && cleanUser.includes(cleanCandidate)) {
      return { isCorrect: true, matchedWith: candidate };
    }

    // Minor typo tolerance for single words / short terms (e.g. 'routerr' -> 'router')
    if (cleanCandidate.length >= 5 && Math.abs(cleanUser.length - cleanCandidate.length) <= 1) {
      const dist = levenshteinDistance(cleanUser, cleanCandidate);
      if (dist <= 1) {
        return { isCorrect: true, matchedWith: candidate };
      }
    }
  }

  return { isCorrect: false };
}

/**
 * Calculates score for Image Puzzle considering revealed hints penalty
 */
export function calculateImagePuzzleScore(
  basePoints: number,
  hintsUsedCount: number,
  penaltyPerHint: number = 10,
  minPointsPercent: number = 0.4
): number {
  const penalty = Math.max(0, hintsUsedCount) * Math.max(0, penaltyPerHint);
  const minPoints = Math.floor(basePoints * minPointsPercent);
  return Math.max(minPoints, basePoints - penalty);
}

/**
 * Metadata definition for 8 PE Movement Groups for THCS students
 */
export interface MovementMetadata {
  id: ExerciseMovementGroup;
  title: string;
  shortName: string;
  description: string;
  studentGuide: string;
  iconName: string;
  color: string;
  defaultReps: number;
  availableReps: number[];
}

export const MOVEMENT_GROUPS_CATALOG: MovementMetadata[] = [
  {
    id: 'neck',
    title: '1. Khớp Cổ (Nghiêng & Xoay)',
    shortName: 'Vận động cổ',
    description: 'Nghiêng đầu sang trái, sang phải, cúi và ngửa nhẹ nhàng giúp thư giãn cơ cổ sau khi nhìn màn hình.',
    studentGuide: 'Giữ lưng thẳng, từ từ nghiêng đầu sang trái rồi sang phải, sau đó cúi nhẹ và ngửa cổ thư giãn.',
    iconName: 'User',
    color: '#3B82F6',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'shoulders',
    title: '2. Khớp Vai (Nâng & Xoay Vai)',
    shortName: 'Xoay khớp vai',
    description: 'Nâng hai vai lên cao rồi thả lỏng, kết hợp xoay tròn khớp vai từ trước ra sau và ngược lại.',
    studentGuide: 'Đặt tay lên mỏm vai hoặc buông tự nhiên, xoay tròn hai vai nhẹ nhàng theo nhịp thở đều.',
    iconName: 'Activity',
    color: '#8B5CF6',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'wrists',
    title: '3. Khớp Cổ Tay (Xoay & Gập Duỗi)',
    shortName: 'Xoay cổ tay',
    description: 'Hai bàn tay đan vào nhau hoặc nắm hờ, xoay tròn cổ tay nhẹ nhàng để tránh mỏi tay khi gõ bàn phím.',
    studentGuide: 'Đan 10 ngón tay vào nhau, xoay tròn cổ tay theo chiều kim đồng hồ rồi đổi chiều.',
    iconName: 'Sparkles',
    color: '#EC4899',
    defaultReps: 6,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'elbows',
    title: '4. Khớp Khuỷu Tay (Gập & Duỗi)',
    shortName: 'Gập duỗi khuỷu tay',
    description: 'Đưa cẳng tay lên ngang vai rồi duỗi thẳng tự nhiên, giúp lưu thông máu toàn bộ hai cánh tay.',
    studentGuide: 'Gập hai cẳng tay về phía ngực, sau đó duỗi thẳng ra hai bên hoặc phía trước.',
    iconName: 'Zap',
    color: '#F59E0B',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'hips',
    title: '5. Khớp Hông (Xoay Hông & Nghiêng Lườn)',
    shortName: 'Xoay hông - lườn',
    description: 'Hai tay chống hông, đứng thẳng chân, xoay tròn hông và nghiêng lườn sang trái, phải nhẹ nhàng.',
    studentGuide: 'Hai tay chống hông, đứng chân rộng bằng vai, xoay hông theo vòng tròn chậm rãi.',
    iconName: 'RotateCw',
    color: '#10B981',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'knees',
    title: '6. Khớp Gối (Xoay Gối & Nhún Chân)',
    shortName: 'Khớp gối & đùi',
    description: 'Hai tay đặt lên đầu gối, chụm chân hoặc đứng rộng, xoay tròn khớp gối hoặc nâng cao đùi nhẹ.',
    studentGuide: 'Cúi nhẹ người, hai tay đặt lên gối, xoay nhẹ từ ngoài vào trong rồi từ trong ra ngoài.',
    iconName: 'TrendingUp',
    color: '#06B6D4',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'ankles',
    title: '7. Khớp Cổ Chân (Xoay Chân Trái - Phải)',
    shortName: 'Xoay cổ chân',
    description: 'Chống mũi chân xuống sàn, xoay tròn cổ chân trái rồi đổi sang chân phải giúp giải tỏa áp lực.',
    studentGuide: 'Đứng vững chân trụ, chống mũi chân còn lại và xoay tròn cổ chân 4 nhịp rồi đổi chân.',
    iconName: 'Footprints',
    color: '#6366F1',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
  {
    id: 'full_body',
    title: '8. Toàn Thân & Vươn Người Thư Giãn',
    shortName: 'Vươn người toàn thân',
    description: 'Hít sâu vươn hai tay lên cao qua đầu, kéo giãn cột sống rồi thở ra từ từ buông tay hạ xuống.',
    studentGuide: 'Đứng thẳng, hít sâu bằng mũi và vươn hai tay thẳng lên trời, sau đó từ từ hạ tay thở ra.',
    iconName: 'Sun',
    color: '#F97316',
    defaultReps: 4,
    availableReps: [2, 4, 6, 8],
  },
];

import { SchoolClass, GradeId } from '../types';
import { CLASS_TO_GRADE } from './cryptoAuth';

/**
 * Checks whether a game is eligible for a particular class (e.g. '7A5')
 * Returns true if:
 * 1. The game explicitly targets this class in `appliedClasses` or `targetClass`
 * 2. Or the game applies to the whole grade and no restrictive classes are specified
 */
export function isGameEligibleForClass(
  game: { gradeId: GradeId; targetClass?: SchoolClass; appliedClasses?: SchoolClass[] },
  className: SchoolClass
): boolean {
  const classGrade = CLASS_TO_GRADE[className];
  if (game.gradeId !== classGrade) {
    return false;
  }

  // If specific classes are specified, the target class must match
  if (game.appliedClasses && game.appliedClasses.length > 0) {
    return game.appliedClasses.includes(className);
  }

  if (game.targetClass) {
    return game.targetClass === className;
  }

  // Otherwise, default applies to all classes of that grade
  return true;
}

/**
 * Creates an independent clone of a game targeted specifically for another class
 * without modifying or sharing mutable references with the original game.
 */
export function cloneGameForTargetClass<
  T extends {
    id: string;
    title: string;
    gradeId: GradeId;
    targetClass?: SchoolClass;
    appliedClasses?: SchoolClass[];
    status: 'draft' | 'published';
    questions: any[];
    createdAt?: string;
    updatedAt?: string;
  }
>(game: T, targetClass: SchoolClass, newTitle?: string): T {
  const newGrade = CLASS_TO_GRADE[targetClass];
  return {
    ...JSON.parse(JSON.stringify(game)),
    id: `${game.id}_clone_${targetClass.toLowerCase()}_${Date.now().toString().slice(-4)}`,
    title: newTitle || `${game.title} (Dành cho Lớp ${targetClass})`,
    gradeId: newGrade,
    targetClass,
    appliedClasses: [targetClass],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

