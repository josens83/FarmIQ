import type { TutorialStep } from '../types';

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FarmIQ',
    titleKo: 'FarmIQ에 오신 것을 환영합니다',
    content: 'Learn smart farming through simulation! This tutorial will guide you through the basics.',
    contentKo: '시뮬레이션을 통해 스마트 농업을 배워보세요! 이 튜토리얼에서 기본 사항을 안내해 드립니다.',
    position: 'bottom'
  },
  {
    id: 'sensor-dashboard',
    title: 'Sensor Dashboard',
    titleKo: '센서 대시보드',
    content: 'Monitor your farm environment in real-time. Temperature, humidity, CO2, and light levels are displayed here.',
    contentKo: '농장 환경을 실시간으로 모니터링하세요. 온도, 습도, CO2, 광량이 여기에 표시됩니다.',
    highlight: '[data-tutorial="sensor-dashboard"]',
    position: 'right'
  },
  {
    id: 'farm-grid',
    title: 'Farm Grid',
    titleKo: '농장 그리드',
    content: 'Click on empty cells to plant crops. Each crop has different environmental requirements.',
    contentKo: '빈 셀을 클릭하여 작물을 심으세요. 각 작물마다 다른 환경 요구 사항이 있습니다.',
    highlight: '[data-tutorial="farm-grid"]',
    position: 'left',
    requiredAction: 'plant-crop'
  },
  {
    id: 'plant-first-crop',
    title: 'Plant Your First Crop',
    titleKo: '첫 작물 심기',
    content: 'Select lettuce or spinach to plant. These are beginner-friendly crops with low maintenance.',
    contentKo: '상추나 시금치를 선택하여 심으세요. 이들은 관리가 쉬운 초보자용 작물입니다.',
    position: 'bottom'
  },
  {
    id: 'equipment-panel',
    title: 'Equipment Control',
    titleKo: '장비 제어',
    content: 'Use heaters, coolers, and fans to maintain optimal growing conditions.',
    contentKo: '히터, 쿨러, 팬을 사용하여 최적의 재배 조건을 유지하세요.',
    highlight: '[data-tutorial="equipment-panel"]',
    position: 'left'
  },
  {
    id: 'activate-equipment',
    title: 'Activate Equipment',
    titleKo: '장비 활성화',
    content: 'Click on equipment to turn it on. Active equipment will affect the environment but consume energy.',
    contentKo: '장비를 클릭하여 켜세요. 활성화된 장비는 환경에 영향을 주지만 에너지를 소비합니다.',
    position: 'top',
    requiredAction: 'toggle-equipment'
  },
  {
    id: 'automation',
    title: 'Automation Rules',
    titleKo: '자동화 규칙',
    content: 'Set up automation rules to automatically control equipment based on sensor readings.',
    contentKo: '센서 데이터를 기반으로 장비를 자동으로 제어하는 자동화 규칙을 설정하세요.',
    highlight: '[data-tutorial="automation-panel"]',
    position: 'left'
  },
  {
    id: 'game-time',
    title: 'Game Time Control',
    titleKo: '게임 시간 제어',
    content: 'Use speed controls to fast-forward time. Crops grow over game days, not real time.',
    contentKo: '속도 조절 버튼으로 시간을 빨리 감기할 수 있습니다. 작물은 실제 시간이 아닌 게임 일 단위로 자랍니다.',
    highlight: '[data-tutorial="time-control"]',
    position: 'bottom'
  },
  {
    id: 'harvesting',
    title: 'Harvesting Crops',
    titleKo: '작물 수확',
    content: 'When crops reach 100% growth, click on them to harvest. Better conditions mean higher quality!',
    contentKo: '작물이 100% 성장하면 클릭하여 수확하세요. 좋은 환경은 더 높은 품질을 의미합니다!',
    position: 'top'
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    titleKo: '튜토리얼 완료!',
    content: 'You now know the basics! Experiment with different crops and automation strategies.',
    contentKo: '이제 기본을 알게 되셨습니다! 다양한 작물과 자동화 전략을 실험해 보세요.',
    position: 'bottom'
  }
];

export const getTutorialStep = (index: number): TutorialStep | undefined => {
  return tutorialSteps[index];
};

export const getTutorialStepById = (id: string): TutorialStep | undefined => {
  return tutorialSteps.find(step => step.id === id);
};
