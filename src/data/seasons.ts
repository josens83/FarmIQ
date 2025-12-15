import type { SeasonConfig, Season } from '../types';

export const seasonConfigs: Record<Season, SeasonConfig> = {
  spring: {
    id: 'spring',
    name: 'Spring',
    nameKo: '봄',
    daysPerSeason: 30,
    temperatureModifier: 0,
    humidityModifier: 5,
    lightModifier: 1.0,
    growthRateModifier: 1.1,
    pestRiskModifier: 1.2,
    diseaseRiskModifier: 1.0,
    marketPriceModifier: 1.0,
    energyCostModifier: 0.9,
    description: 'Ideal growing season with moderate temperatures and increased humidity.',
    descriptionKo: '적당한 온도와 증가된 습도로 이상적인 재배 시즌입니다.'
  },
  summer: {
    id: 'summer',
    name: 'Summer',
    nameKo: '여름',
    daysPerSeason: 30,
    temperatureModifier: 8,
    humidityModifier: -5,
    lightModifier: 1.3,
    growthRateModifier: 1.2,
    pestRiskModifier: 1.5,
    diseaseRiskModifier: 0.8,
    marketPriceModifier: 0.9,
    energyCostModifier: 1.3,
    description: 'Hot season with high energy costs for cooling. Great for heat-loving crops.',
    descriptionKo: '냉각을 위한 에너지 비용이 높은 더운 시즌입니다. 열을 좋아하는 작물에 좋습니다.'
  },
  fall: {
    id: 'fall',
    name: 'Fall',
    nameKo: '가을',
    daysPerSeason: 30,
    temperatureModifier: -2,
    humidityModifier: 0,
    lightModifier: 0.9,
    growthRateModifier: 1.0,
    pestRiskModifier: 0.7,
    diseaseRiskModifier: 1.2,
    marketPriceModifier: 1.2,
    energyCostModifier: 1.0,
    description: 'Harvest season with higher market prices. Watch for increased disease risk.',
    descriptionKo: '시장 가격이 높은 수확 시즌입니다. 증가된 질병 위험에 주의하세요.'
  },
  winter: {
    id: 'winter',
    name: 'Winter',
    nameKo: '겨울',
    daysPerSeason: 30,
    temperatureModifier: -10,
    humidityModifier: -10,
    lightModifier: 0.7,
    growthRateModifier: 0.8,
    pestRiskModifier: 0.3,
    diseaseRiskModifier: 0.5,
    marketPriceModifier: 1.5,
    energyCostModifier: 1.5,
    description: 'Cold season requiring heating. Premium prices but slower growth.',
    descriptionKo: '난방이 필요한 추운 시즌입니다. 프리미엄 가격이지만 성장이 느립니다.'
  }
};

export const getSeasonByDay = (day: number, daysPerSeason: number = 30): Season => {
  const dayOfYear = ((day - 1) % (daysPerSeason * 4)) + 1;
  if (dayOfYear <= daysPerSeason) return 'spring';
  if (dayOfYear <= daysPerSeason * 2) return 'summer';
  if (dayOfYear <= daysPerSeason * 3) return 'fall';
  return 'winter';
};

export const getDayOfSeason = (day: number, daysPerSeason: number = 30): number => {
  const dayOfYear = ((day - 1) % (daysPerSeason * 4)) + 1;
  return ((dayOfYear - 1) % daysPerSeason) + 1;
};

export const getYear = (day: number, daysPerSeason: number = 30): number => {
  return Math.floor((day - 1) / (daysPerSeason * 4)) + 1;
};

export const getSeasonProgress = (dayOfSeason: number, daysPerSeason: number = 30): number => {
  return dayOfSeason / daysPerSeason;
};

export const getNextSeason = (current: Season): Season => {
  const order: Season[] = ['spring', 'summer', 'fall', 'winter'];
  const currentIndex = order.indexOf(current);
  return order[(currentIndex + 1) % 4];
};

// Crop season preferences - which crops grow best in which seasons
export const cropSeasonPreferences: Record<string, { preferred: Season[]; bonus: number }> = {
  lettuce: { preferred: ['spring', 'fall'], bonus: 0.15 },
  spinach: { preferred: ['spring', 'fall', 'winter'], bonus: 0.2 },
  basil: { preferred: ['summer'], bonus: 0.25 },
  strawberry: { preferred: ['spring'], bonus: 0.2 },
  tomato: { preferred: ['summer'], bonus: 0.2 },
  paprika: { preferred: ['summer'], bonus: 0.2 },
  cucumber: { preferred: ['summer'], bonus: 0.15 },
  kale: { preferred: ['fall', 'winter'], bonus: 0.25 }
};

export const getCropSeasonBonus = (cropId: string, season: Season): number => {
  const pref = cropSeasonPreferences[cropId];
  if (!pref) return 0;
  return pref.preferred.includes(season) ? pref.bonus : 0;
};
