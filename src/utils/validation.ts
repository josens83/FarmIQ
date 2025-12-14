import { z } from 'zod';

// ============================================
// Crop-related schemas
// ============================================

/**
 * Schema for planting a new crop
 */
export const plantCropSchema = z.object({
  cropId: z
    .string()
    .min(1, '작물 ID는 필수입니다')
    .max(50, '작물 ID가 너무 깁니다')
    .regex(/^[a-z-]+$/, '유효하지 않은 작물 ID 형식입니다'),
  position: z.object({
    x: z.number().int('X 좌표는 정수여야 합니다').min(0, 'X 좌표는 0 이상이어야 합니다').max(20, 'X 좌표가 범위를 벗어났습니다'),
    y: z.number().int('Y 좌표는 정수여야 합니다').min(0, 'Y 좌표는 0 이상이어야 합니다').max(20, 'Y 좌표가 범위를 벗어났습니다')
  })
});

export type PlantCropInput = z.infer<typeof plantCropSchema>;

/**
 * Schema for harvesting a crop
 */
export const harvestCropSchema = z.object({
  instanceId: z
    .string()
    .uuid('유효하지 않은 작물 인스턴스 ID입니다')
});

export type HarvestCropInput = z.infer<typeof harvestCropSchema>;

// ============================================
// Automation rule schemas
// ============================================

const sensorTypes = ['temperature', 'humidity', 'co2', 'light', 'soil', 'ph', 'ec'] as const;
const conditions = ['above', 'below', 'between'] as const;
const actions = ['activate', 'deactivate', 'setLevel'] as const;
const languages = ['ko', 'en'] as const;

export const sensorTypeSchema = z.enum(sensorTypes, {
  message: '유효하지 않은 센서 타입입니다'
});

export const conditionSchema = z.enum(conditions, {
  message: '유효하지 않은 조건입니다'
});

export const actionSchema = z.enum(actions, {
  message: '유효하지 않은 액션입니다'
});

/**
 * Schema for creating an automation rule
 */
export const automationRuleSchema = z.object({
  name: z
    .string()
    .min(1, '규칙 이름은 필수입니다')
    .max(100, '규칙 이름이 너무 깁니다')
    .trim(),
  sensorType: sensorTypeSchema,
  condition: conditionSchema,
  threshold: z
    .number()
    .min(-100, '임계값이 너무 낮습니다')
    .max(10000, '임계값이 너무 높습니다'),
  thresholdMax: z
    .number()
    .min(-100, '최대 임계값이 너무 낮습니다')
    .max(10000, '최대 임계값이 너무 높습니다')
    .optional(),
  equipmentId: z
    .string()
    .uuid('유효하지 않은 장비 ID입니다'),
  action: actionSchema,
  isEnabled: z.boolean().default(true)
}).refine(
  (data) => {
    // If condition is 'between', thresholdMax must be provided
    if (data.condition === 'between') {
      return data.thresholdMax !== undefined && data.thresholdMax > data.threshold;
    }
    return true;
  },
  {
    message: '"between" 조건을 사용할 때는 최대 임계값이 최소 임계값보다 커야 합니다',
    path: ['thresholdMax']
  }
);

export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;

// ============================================
// Equipment schemas
// ============================================

/**
 * Schema for purchasing equipment
 */
export const purchaseEquipmentSchema = z.object({
  equipmentId: z
    .string()
    .min(1, '장비 ID는 필수입니다')
    .max(50, '장비 ID가 너무 깁니다')
    .regex(/^[a-z-]+$/, '유효하지 않은 장비 ID 형식입니다')
});

export type PurchaseEquipmentInput = z.infer<typeof purchaseEquipmentSchema>;

/**
 * Schema for equipment settings
 */
export const equipmentSettingsSchema = z.object({
  equipmentId: z.string().uuid('유효하지 않은 장비 ID입니다'),
  isActive: z.boolean().optional(),
  autoMode: z.boolean().optional(),
  targetValue: z.number().min(0).max(10000).optional(),
  currentSetting: z.number().min(0).max(100).optional()
});

export type EquipmentSettingsInput = z.infer<typeof equipmentSettingsSchema>;

// ============================================
// Player settings schemas
// ============================================

export const languageSchema = z.enum(languages, {
  message: '지원하지 않는 언어입니다'
});

/**
 * Schema for player settings
 */
export const playerSettingsSchema = z.object({
  soundEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
  language: languageSchema,
  showTutorial: z.boolean(),
  autoSaveEnabled: z.boolean(),
  gameSpeed: z.number().int().min(1).max(4)
});

export type PlayerSettingsInput = z.infer<typeof playerSettingsSchema>;

// ============================================
// Game save data schemas
// ============================================

/**
 * Schema for save game name
 */
export const saveGameSchema = z.object({
  name: z
    .string()
    .min(1, '저장 이름은 필수입니다')
    .max(50, '저장 이름이 너무 깁니다')
    .regex(/^[가-힣a-zA-Z0-9\s_-]+$/, '저장 이름에 특수문자를 사용할 수 없습니다')
});

export type SaveGameInput = z.infer<typeof saveGameSchema>;

// ============================================
// Validation helper functions
// ============================================

/**
 * Type-safe validation result
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

/**
 * Validate input data against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => issue.message)
  };
}

/**
 * Validate input data and throw on failure
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Create a type-safe validator function for a schema
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validateInput(schema, data);
}

// Pre-built validators for common operations
export const validators = {
  plantCrop: createValidator(plantCropSchema),
  harvestCrop: createValidator(harvestCropSchema),
  automationRule: createValidator(automationRuleSchema),
  purchaseEquipment: createValidator(purchaseEquipmentSchema),
  equipmentSettings: createValidator(equipmentSettingsSchema),
  playerSettings: createValidator(playerSettingsSchema),
  saveGame: createValidator(saveGameSchema)
};

export default validators;
