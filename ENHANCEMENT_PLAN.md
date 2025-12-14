# FarmIQ 프로젝트 고도화 계획

**Version**: 1.0
**작성일**: 2025년 12월
**대상 프로젝트**: FarmIQ Smart Farm Simulation

---

## 목차

1. [현황 진단](#1-현황-진단)
2. [위험 평가](#2-위험-평가)
3. [단계별 고도화 전략](#3-단계별-고도화-전략)
4. [품질 게이트 정의](#4-품질-게이트-정의)
5. [테스트 전략](#5-테스트-전략)
6. [보안 강화 계획](#6-보안-강화-계획)
7. [성능 최적화 계획](#7-성능-최적화-계획)
8. [KPI 및 성과 측정](#8-kpi-및-성과-측정)
9. [구현 체크리스트](#9-구현-체크리스트)

---

## 1. 현황 진단

### 1.1 코드베이스 현황

| 항목 | 현재 값 | 비고 |
|------|---------|------|
| 총 소스 파일 | 46개 | TypeScript/TSX |
| 총 코드 라인 | 5,639줄 | 주석 포함 |
| 컴포넌트 코드 | 2,071줄 | 38% |
| 게임 시스템 코드 | 1,063줄 | 19% |
| 상태 관리 코드 | 928줄 | 16% |
| 타입 정의 | 441줄 | 8% |
| 테스트 파일 | 0개 | **개선 필요** |
| 문서화 수준 | 기본 | README만 존재 |

### 1.2 아키텍처 분석

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │   HUD   │  │Dashboard│  │  Farm   │  │  Controls   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘ │
└───────┼────────────┼────────────┼──────────────┼────────┘
        │            │            │              │
┌───────┴────────────┴────────────┴──────────────┴────────┐
│                    State Layer (Zustand)                 │
│  ┌────────┐ ┌───────────┐ ┌──────┐ ┌─────────┐ ┌──────┐ │
│  │  Game  │ │Environment│ │ Crop │ │Equipment│ │Player│ │
│  └────────┘ └───────────┘ └──────┘ └─────────┘ └──────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    Game Engine Layer                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ Automation │ │Environment │ │CropGrowth  │           │
│  │  System    │ │  System    │ │  System    │           │
│  └────────────┘ └────────────┘ └────────────┘           │
│  ┌────────────┐ ┌────────────┐                          │
│  │  Economy   │ │   Event    │                          │
│  │  System    │ │  System    │                          │
│  └────────────┘ └────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 기술 스택 현황

| 카테고리 | 기술 | 버전 | 상태 |
|---------|------|------|------|
| 프레임워크 | React | 19.2 | ✅ 최신 |
| 언어 | TypeScript | 5.9 | ✅ 최신 |
| 스타일링 | Tailwind CSS | 4.1 | ✅ 최신 |
| 상태관리 | Zustand | 5.0 | ✅ 최신 |
| 차트 | Recharts | 3.5 | ✅ 최신 |
| 빌드 | Vite | 7.2 | ✅ 최신 |
| PWA | vite-plugin-pwa | 1.2 | ✅ |
| 테스트 | - | - | ❌ 미구현 |
| E2E 테스트 | - | - | ❌ 미구현 |
| CI/CD | - | - | ❌ 미구현 |

### 1.4 식별된 문제점

#### 🔴 심각 (Critical)
1. **테스트 코드 부재**: 단위/통합/E2E 테스트 0%
2. **보안 검증 미흡**: 입력 검증, XSS 방지 로직 부재
3. **에러 핸들링 미흡**: 글로벌 에러 바운더리 없음

#### 🟡 중요 (Major)
4. **코드 문서화 부족**: JSDoc 주석 미비
5. **접근성 미구현**: ARIA 속성, 키보드 네비게이션 부재
6. **국제화 하드코딩**: 문자열 직접 삽입
7. **성능 모니터링 부재**: 메트릭 수집 없음
8. **로깅 시스템 부재**: 디버깅용 로그 없음

#### 🟢 보통 (Minor)
9. **일부 미사용 import**: 빌드 시 경고 발생
10. **반응형 디자인 개선 필요**: 일부 모바일 UI 최적화 부족
11. **애니메이션 성능**: 복잡한 CSS 애니메이션 최적화 필요

---

## 2. 위험 평가

### 2.1 위험 우선순위 매트릭스

```
영향도 ↑
    │
높음│  [보안취약점]   [테스트부재]
    │     P1             P1
    │
중간│  [에러핸들링]   [성능이슈]     [접근성]
    │     P2             P2           P3
    │
낮음│  [문서화]       [코드정리]
    │     P3             P4
    │
    └────────────────────────────────→ 발생가능성
        낮음          중간          높음
```

### 2.2 위험 완화 계획

| 위험 | 우선순위 | 완화 전략 | 목표 시점 |
|------|---------|----------|----------|
| 테스트 부재 | P1 | 테스트 프레임워크 도입 + 핵심 기능 테스트 | Phase 1 |
| 보안 취약점 | P1 | 보안 감사 + 입력 검증 구현 | Phase 1 |
| 에러 핸들링 | P2 | Error Boundary + 에러 로깅 | Phase 1 |
| 성능 이슈 | P2 | 프로파일링 + 최적화 | Phase 2 |
| 접근성 | P3 | WCAG 2.1 준수 | Phase 2 |
| 문서화 | P3 | JSDoc + Storybook | Phase 2 |

---

## 3. 단계별 고도화 전략

### Phase 1: 기반 구축 (2주)

#### 3.1.1 테스트 인프라 구축

```bash
# 설치 필요 패키지
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @vitest/coverage-v8 jsdom
npm install -D playwright @playwright/test
```

**작업 항목:**
- [ ] Vitest 설정 및 초기 환경 구축
- [ ] Testing Library 설정
- [ ] Playwright E2E 테스트 설정
- [ ] GitHub Actions CI 파이프라인 구축
- [ ] 테스트 커버리지 리포트 설정

#### 3.1.2 품질 도구 설정

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build
```

#### 3.1.3 핵심 유닛 테스트 작성

**우선순위 테스트 대상:**
1. `GameEngine` - 게임 루프 및 틱 시스템
2. `CropGrowthSystem` - 작물 성장 계산
3. `EnvironmentSystem` - 환경 시뮬레이션
4. `EconomySystem` - 경제 계산
5. Zustand Stores - 상태 관리

### Phase 2: 품질 강화 (3주)

#### 3.2.1 보안 강화

**입력 검증 레이어 추가:**
```typescript
// src/utils/validation.ts
export const ValidationSchema = {
  cropPlant: z.object({
    cropId: z.string().min(1).max(50),
    position: z.object({
      x: z.number().int().min(0).max(20),
      y: z.number().int().min(0).max(20)
    })
  }),

  automationRule: z.object({
    name: z.string().min(1).max(100).trim(),
    threshold: z.number().min(-100).max(10000),
    sensorType: z.enum(['temperature', 'humidity', 'co2', 'light', 'soil', 'ph', 'ec']),
    condition: z.enum(['above', 'below', 'between'])
  })
};
```

#### 3.2.2 에러 핸들링 시스템

```typescript
// src/components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 서비스로 전송
    logError(error, errorInfo);
  }
}
```

#### 3.2.3 접근성 개선

- [ ] 모든 인터랙티브 요소에 ARIA 레이블 추가
- [ ] 키보드 네비게이션 구현
- [ ] 스크린 리더 지원
- [ ] 색상 대비 검증 (WCAG AA 기준)
- [ ] Focus 표시 개선

### Phase 3: 고급 기능 (3주)

#### 3.3.1 성능 최적화

```typescript
// React.memo를 활용한 불필요한 리렌더링 방지
export const CropTile = React.memo<CropTileProps>(({ crop, onSelect }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.crop.instanceId === nextProps.crop.instanceId &&
         prevProps.crop.growthProgress === nextProps.crop.growthProgress &&
         prevProps.crop.health === nextProps.crop.health;
});

// useMemo를 활용한 계산 최적화
const sortedCrops = useMemo(() =>
  crops.sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x),
  [crops]
);
```

#### 3.3.2 국제화 (i18n) 시스템

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: koTranslations },
    en: { translation: enTranslations }
  },
  lng: 'ko',
  fallbackLng: 'en'
});
```

#### 3.3.3 분석 및 모니터링

```typescript
// src/utils/analytics.ts
export const analytics = {
  trackEvent: (event: string, properties?: Record<string, any>) => {
    // Google Analytics, Mixpanel 등 연동
  },
  trackError: (error: Error, context?: Record<string, any>) => {
    // Sentry 등 에러 트래킹 서비스 연동
  },
  trackPerformance: (metric: string, value: number) => {
    // 성능 메트릭 수집
  }
};
```

### Phase 4: 지속적 개선 (ongoing)

- 정기적인 의존성 업데이트
- 성능 벤치마크 모니터링
- 사용자 피드백 기반 개선
- A/B 테스트 인프라
- 기술 부채 상환

---

## 4. 품질 게이트 정의

### 4.1 코드 품질 기준

```yaml
quality_gates:
  mandatory:
    type_check: "no errors"
    lint: "no errors, max 10 warnings"
    build: "success"

  code_quality:
    test_coverage_line: ">= 80%"
    test_coverage_branch: ">= 70%"
    code_duplication: "< 5%"
    cyclomatic_complexity: "< 15 per function"

  security:
    critical_vulnerabilities: 0
    high_vulnerabilities: 0
    medium_vulnerabilities: "< 3"

  performance:
    bundle_size_main: "< 500KB gzip"
    lighthouse_performance: ">= 90"
    first_contentful_paint: "< 1.5s"
```

### 4.2 PR 체크리스트

```markdown
## PR 체크리스트

### 필수 (Mandatory)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 테스트 통과 (`npm run test`)
- [ ] 빌드 성공 (`npm run build`)

### 코드 품질
- [ ] 새로운 코드에 대한 테스트 작성
- [ ] 기존 테스트 업데이트 (해당시)
- [ ] 복잡한 로직에 주석 추가
- [ ] 타입 정의 추가/업데이트

### 보안
- [ ] 사용자 입력 검증
- [ ] 민감 정보 하드코딩 없음
- [ ] XSS/인젝션 방지

### 문서화
- [ ] README 업데이트 (해당시)
- [ ] JSDoc 주석 추가 (공개 API)
- [ ] 변경사항 CHANGELOG 추가
```

---

## 5. 테스트 전략

### 5.1 테스트 피라미드

```
                    ┌─────────┐
                    │  E2E   │  10%
                    │  Test  │
                   ┌┴───────┴┐
                   │Integration│  20%
                   │   Test    │
                  ┌┴─────────┴┐
                  │   Unit    │  70%
                  │   Test    │
                  └───────────┘
```

### 5.2 테스트 범위 정의

#### 단위 테스트 (Unit Tests)

| 모듈 | 테스트 항목 | 우선순위 |
|------|------------|---------|
| GameEngine | 게임 루프, 틱 시스템, 일시정지/재개 | P1 |
| CropGrowthSystem | 성장률 계산, 스트레스 계산, 품질 계산 | P1 |
| EnvironmentSystem | 자연 변화, 장비 효과, 센서 업데이트 | P1 |
| AutomationSystem | 조건 평가, 액션 실행 | P1 |
| EconomySystem | 비용 계산, 수익 계산 | P1 |
| Zustand Stores | 상태 변경, 영속성 | P1 |
| Utility Functions | 헬퍼 함수들 | P2 |

**예시 테스트 케이스:**

```typescript
// src/game/systems/__tests__/CropGrowthSystem.test.ts
describe('CropGrowthSystem', () => {
  describe('calculateGrowthRate', () => {
    it('최적 환경에서 최대 성장률 반환', () => {
      const system = new CropGrowthSystem();
      const crop = createMockCrop({ health: 100 });
      const env = createOptimalEnvironment('lettuce');

      const rate = system['calculateGrowthRate'](crop, env, cropDefinitions.lettuce);

      expect(rate).toBeGreaterThan(0.4);
    });

    it('온도가 범위 밖일 때 성장률 감소', () => {
      const system = new CropGrowthSystem();
      const crop = createMockCrop({ health: 100 });
      const env = createEnvironment({ temperature: 35 }); // 상추 최적: 18-24

      const rate = system['calculateGrowthRate'](crop, env, cropDefinitions.lettuce);

      expect(rate).toBeLessThan(0.3);
    });

    it('건강도가 낮을 때 성장률 감소', () => {
      const system = new CropGrowthSystem();
      const crop = createMockCrop({ health: 30 });
      const env = createOptimalEnvironment('lettuce');

      const rate = system['calculateGrowthRate'](crop, env, cropDefinitions.lettuce);

      expect(rate).toBeLessThan(0.2);
    });
  });

  describe('calculateStress', () => {
    it('최적 환경에서 스트레스 최소', () => {
      // ...
    });

    it('높은 습도에서 질병 스트레스 증가', () => {
      // ...
    });
  });
});
```

#### 통합 테스트 (Integration Tests)

```typescript
// src/__tests__/integration/game-flow.test.ts
describe('Game Flow Integration', () => {
  it('작물 심기 → 성장 → 수확 플로우', async () => {
    // 게임 엔진 시작
    GameEngine.start();

    // 작물 심기
    const success = GameEngine.plantCrop('lettuce', { x: 0, y: 0 });
    expect(success).toBe(true);

    // 시간 진행 시뮬레이션 (35일)
    for (let i = 0; i < 35 * 24 * 10; i++) {
      useGameStore.getState().advanceTick();
    }

    // 수확 가능 확인
    const crops = useCropStore.getState().crops;
    expect(crops[0].harvestable).toBe(true);

    // 수확
    const result = GameEngine.harvestCrop(crops[0].instanceId);
    expect(result).toBe(true);

    // 수익 확인
    const money = usePlayerStore.getState().money;
    expect(money).toBeGreaterThan(10000);
  });
});
```

#### E2E 테스트 (End-to-End Tests)

```typescript
// e2e/game.spec.ts
import { test, expect } from '@playwright/test';

test.describe('FarmIQ Game', () => {
  test('새 게임 시작 및 작물 심기', async ({ page }) => {
    await page.goto('/');

    // 시작 화면 확인
    await expect(page.locator('text=FarmIQ')).toBeVisible();

    // 새 게임 시작
    await page.click('button:has-text("새 게임")');

    // 게임 화면 로드 확인
    await expect(page.locator('[data-testid="farm-grid"]')).toBeVisible();

    // 빈 셀 클릭하여 작물 심기
    await page.click('[data-testid="cell-0-0"]');

    // 작물 선택 모달 확인
    await expect(page.locator('text=작물 선택')).toBeVisible();

    // 상추 선택
    await page.click('[data-testid="crop-lettuce"]');

    // 작물이 심어졌는지 확인
    await expect(page.locator('[data-testid="cell-0-0"] [data-testid="crop-tile"]')).toBeVisible();
  });
});
```

---

## 6. 보안 강화 계획

### 6.1 보안 체크리스트

```markdown
## 보안 자가 검증 결과

### 입력 검증
- [ ] 모든 사용자 입력에 Zod 스키마 검증 적용
- [ ] 숫자 입력 범위 제한
- [ ] 문자열 길이 제한
- [ ] 특수문자 이스케이프

### XSS 방지
- [ ] React의 기본 이스케이프 활용
- [ ] dangerouslySetInnerHTML 사용 금지
- [ ] URL 파라미터 검증

### 데이터 보호
- [ ] localStorage 데이터 민감정보 없음
- [ ] 콘솔 로그에 민감정보 출력 금지
- [ ] 에러 메시지에 시스템 정보 노출 금지

### 의존성 보안
- [ ] npm audit 정기 실행
- [ ] 알려진 취약점 패키지 업데이트
- [ ] lockfile 커밋
```

### 6.2 입력 검증 구현

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const schemas = {
  // 작물 심기 요청
  plantCrop: z.object({
    cropId: z.string()
      .min(1, '작물 ID는 필수입니다')
      .max(50, '작물 ID가 너무 깁니다')
      .regex(/^[a-z-]+$/, '유효하지 않은 작물 ID 형식'),
    position: z.object({
      x: z.number().int().min(0).max(20),
      y: z.number().int().min(0).max(20)
    })
  }),

  // 자동화 규칙
  automationRule: z.object({
    name: z.string()
      .min(1, '규칙 이름은 필수입니다')
      .max(100, '규칙 이름이 너무 깁니다')
      .trim(),
    sensorType: z.enum([
      'temperature', 'humidity', 'co2',
      'light', 'soil', 'ph', 'ec'
    ]),
    condition: z.enum(['above', 'below', 'between']),
    threshold: z.number()
      .min(-100, '임계값이 너무 낮습니다')
      .max(10000, '임계값이 너무 높습니다'),
    equipmentId: z.string().uuid('유효하지 않은 장비 ID'),
    action: z.enum(['activate', 'deactivate', 'setLevel'])
  }),

  // 플레이어 설정
  playerSettings: z.object({
    soundEnabled: z.boolean(),
    musicEnabled: z.boolean(),
    notificationsEnabled: z.boolean(),
    language: z.enum(['ko', 'en']),
    showTutorial: z.boolean(),
    autoSaveEnabled: z.boolean()
  })
};

// 검증 헬퍼 함수
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map(e => e.message)
  };
}
```

---

## 7. 성능 최적화 계획

### 7.1 현재 성능 지표 (추정)

| 지표 | 현재 | 목표 | 방법 |
|------|------|------|------|
| 번들 크기 | ~600KB | < 400KB | Code splitting, Tree shaking |
| FCP | ~2s | < 1.5s | Lazy loading, Preload |
| TTI | ~3s | < 2s | 코드 최적화 |
| 게임 루프 FPS | 60fps | 60fps 유지 | 렌더링 최적화 |

### 7.2 최적화 전략

#### 코드 스플리팅

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const GameLayout = lazy(() => import('./layouts/GameLayout'));
const StartScreen = lazy(() => import('./pages/StartScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {showGame ? <GameLayout /> : <StartScreen />}
    </Suspense>
  );
}
```

#### React 메모이제이션

```typescript
// 컴포넌트 메모이제이션
export const SensorGauge = React.memo<SensorGaugeProps>(({
  type, value, optimalRange
}) => {
  // 컴포넌트 로직
});

// 값 메모이제이션
const chartData = useMemo(() =>
  history.slice(-50).map(transformHistoryEntry),
  [history]
);

// 콜백 메모이제이션
const handleCellClick = useCallback((x: number, y: number) => {
  // 클릭 핸들러 로직
}, [/* dependencies */]);
```

#### 가상화

```typescript
// 대량 데이터 렌더링 최적화
import { useVirtualizer } from '@tanstack/react-virtual';

function CropList({ crops }: { crops: CropInstance[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: crops.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80
  });

  return (
    <div ref={parentRef} style={{ overflow: 'auto', height: '400px' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <CropItem key={crops[virtualRow.index].instanceId} />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. KPI 및 성과 측정

### 8.1 품질 KPI

```yaml
code_quality:
  test_coverage:
    current: 0%
    target_phase1: 50%
    target_phase2: 70%
    target_phase3: 80%

  type_safety:
    current: "strict mode enabled"
    target: "no any types"

  code_duplication:
    current: "unknown"
    target: "< 5%"

  cyclomatic_complexity:
    target: "< 15 per function"
```

### 8.2 성능 KPI

```yaml
performance:
  bundle_size:
    current: "607KB"
    target: "< 400KB"

  lighthouse_score:
    performance: ">= 90"
    accessibility: ">= 90"
    best_practices: ">= 90"
    seo: ">= 90"

  core_web_vitals:
    lcp: "< 2.5s"
    fid: "< 100ms"
    cls: "< 0.1"
```

### 8.3 개발 생산성 KPI

```yaml
productivity:
  ci_pipeline_time:
    target: "< 5 minutes"

  deployment_frequency:
    current: "manual"
    target: "automated per PR"

  lead_time:
    target: "< 1 day from commit to deploy"

  mttr:
    target: "< 1 hour"
```

---

## 9. 구현 체크리스트

### Phase 1 (즉시 - 2주)

#### Week 1
- [ ] Vitest 설치 및 설정
- [ ] Testing Library 설정
- [ ] 첫 번째 단위 테스트 작성 (GameEngine)
- [ ] GitHub Actions CI 기본 설정
- [ ] ESLint/Prettier 규칙 강화

#### Week 2
- [ ] 핵심 시스템 테스트 작성 (CropGrowth, Environment)
- [ ] Zustand 스토어 테스트 작성
- [ ] Error Boundary 구현
- [ ] Zod 입력 검증 추가
- [ ] 테스트 커버리지 리포트 설정

### Phase 2 (3-5주)

#### Week 3
- [ ] 통합 테스트 작성
- [ ] Playwright E2E 테스트 설정
- [ ] 접근성 감사 및 개선 시작
- [ ] 성능 프로파일링

#### Week 4
- [ ] 접근성 개선 완료
- [ ] i18n 시스템 도입
- [ ] 번들 크기 최적화
- [ ] 코드 스플리팅 적용

#### Week 5
- [ ] E2E 테스트 완료
- [ ] 문서화 (JSDoc, Storybook)
- [ ] 성능 최적화 완료
- [ ] Phase 2 리뷰 및 회고

### Phase 3 (6-8주)

- [ ] 분석/모니터링 시스템 구축
- [ ] A/B 테스트 인프라
- [ ] 고급 기능 추가
- [ ] 기술 부채 상환
- [ ] 최종 품질 검증

---

## 10. 자가 검증 체크리스트

모든 코드 변경 시 다음 질문에 답하라:

```markdown
□ 이 코드는 6개월 후 다른 개발자가 이해할 수 있는가?
□ 엣지 케이스와 에러 상황이 적절히 처리되는가?
□ 기존 코드베이스의 패턴과 일관성이 있는가?
□ 보안 취약점은 없는가?
□ 성능 병목이 될 가능성은 없는가?
□ 테스트가 충분히 작성되었는가?
□ 더 간단한 해결책은 없는가?
□ 이 코드가 프로덕션에서 실패한다면 어떻게 디버깅할 것인가?
```

---

## 부록 A: 추가 설치 패키지

```bash
# 테스트
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @vitest/coverage-v8 jsdom happy-dom
npm install -D playwright @playwright/test

# 코드 품질
npm install -D @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react-hooks eslint-plugin-jsx-a11y

# 검증
npm install zod

# 국제화
npm install i18next react-i18next

# 성능
npm install @tanstack/react-virtual

# 모니터링 (선택)
npm install @sentry/react
```

## 부록 B: 설정 파일 템플릿

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

### playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

---

**문서 버전 기록**

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| 1.0 | 2025-12 | 초기 작성 |

