import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Season,
  SeasonState,
  WeatherState,
  WeatherType,
  WeatherForecast,
  MarketState,
  MarketPrice,
  ResourceState,
  PestDiseaseState,
  PestInstance,
  DiseaseInstance,
  PestType,
  DiseaseType
} from '../types';
import { seasonConfigs, getSeasonByDay, getDayOfSeason, getYear } from '../data/seasons';
import { weatherConfigs, getWeatherForSeason, getWeatherDuration } from '../data/weather';
import { cropDefinitions } from '../data/crops';
import { v4 as uuidv4 } from 'uuid';

interface WorldStore {
  // Season
  season: SeasonState;
  updateSeason: (day: number) => void;

  // Weather
  weather: WeatherState;
  updateWeather: (totalTicks: number) => void;
  generateForecast: () => void;

  // Market
  market: MarketState;
  updateMarketPrices: (day: number) => void;
  triggerMarketEvent: (cropId: string, multiplier: number, duration: number) => void;
  getCurrentPrice: (cropId: string) => number;

  // Resources
  resources: ResourceState;
  consumeWater: (liters: number) => void;
  consumeNutrients: (n: number, p: number, k: number) => void;
  refillWater: (liters: number) => void;
  refillNutrients: (n: number, p: number, k: number) => void;
  purchaseResources: (type: 'water' | 'nutrients', amount: number) => number;

  // Pest & Disease
  pestDisease: PestDiseaseState;
  addPest: (type: PestType, cells: string[]) => void;
  addDisease: (type: DiseaseType, cells: string[]) => void;
  applyTreatment: (treatmentId: string, targetId: string) => boolean;
  updatePestDisease: () => void;
  inspectFarm: () => void;

  // Reset
  resetWorld: () => void;
}

const initialSeasonState: SeasonState = {
  current: 'spring',
  dayOfSeason: 1,
  year: 1,
  daysPerSeason: 30
};

const initialWeatherState: WeatherState = {
  current: 'clear',
  temperature: 20,
  humidity: 60,
  windSpeed: 5,
  startTime: 0,
  duration: 24,
  forecast: []
};

const initialMarketState: MarketState = {
  prices: Object.fromEntries(
    Object.entries(cropDefinitions).map(([id, crop]) => [
      id,
      {
        cropId: id,
        basePrice: crop.basePrice,
        currentPrice: crop.basePrice,
        priceChange: 0,
        trend: 'stable' as const,
        volatility: 0.1 + (crop.difficulty * 0.05)
      }
    ])
  ),
  priceHistory: [],
  demandLevels: Object.fromEntries(
    Object.keys(cropDefinitions).map(id => [id, 'normal' as const])
  ),
  lastUpdate: 0
};

const initialResourceState: ResourceState = {
  water: {
    available: 1000,
    capacity: 2000,
    dailyUsage: 0,
    efficiency: 0.8,
    costPerLiter: 0.002,
    autoRefill: true
  },
  nutrients: {
    nitrogen: 50,
    phosphorus: 50,
    potassium: 50,
    capacity: 100,
    dailyUsage: { n: 0, p: 0, k: 0 },
    costPerKg: 5,
    autoRefill: true
  },
  energy: {
    dailyUsage: 0,
    peakUsage: 0,
    costPerKwh: 0.12,
    solarGeneration: 0,
    efficiency: 1.0
  }
};

const initialPestDiseaseState: PestDiseaseState = {
  activePests: [],
  activeDiseases: [],
  preventionLevel: 50,
  lastInspection: 0,
  treatmentHistory: []
};

export const useWorldStore = create<WorldStore>()(
  persist(
    (set, get) => ({
      season: initialSeasonState,
      weather: initialWeatherState,
      market: initialMarketState,
      resources: initialResourceState,
      pestDisease: initialPestDiseaseState,

      updateSeason: (day) => {
        const current = getSeasonByDay(day);
        const dayOfSeason = getDayOfSeason(day);
        const year = getYear(day);

        set((state) => ({
          season: {
            ...state.season,
            current,
            dayOfSeason,
            year
          }
        }));
      },

      updateWeather: (totalTicks) => {
        const { weather, season } = get();
        const ticksSinceStart = totalTicks - weather.startTime;
        const hoursElapsed = ticksSinceStart / 10; // Assuming 10 ticks per hour

        // Check if weather should change
        if (hoursElapsed >= weather.duration) {
          const newWeather = getWeatherForSeason(season.current);
          const newDuration = getWeatherDuration(newWeather);
          const config = weatherConfigs[newWeather];

          set({
            weather: {
              current: newWeather,
              temperature: 20 + seasonConfigs[season.current].temperatureModifier + config.temperatureModifier,
              humidity: 60 + seasonConfigs[season.current].humidityModifier + config.humidityModifier,
              windSpeed: newWeather === 'windy' ? 25 : newWeather === 'stormy' ? 35 : 8,
              startTime: totalTicks,
              duration: newDuration,
              forecast: get().weather.forecast
            }
          });
        }
      },

      generateForecast: () => {
        const { season } = get();
        const forecast: WeatherForecast[] = [];

        for (let i = 1; i <= 5; i++) {
          const futureDay = season.dayOfSeason + i;
          const futureSeason = futureDay > season.daysPerSeason
            ? (['spring', 'summer', 'fall', 'winter'] as Season[])[
                (['spring', 'summer', 'fall', 'winter'].indexOf(season.current) + 1) % 4
              ]
            : season.current;

          const weather = getWeatherForSeason(futureSeason);
          const config = weatherConfigs[weather];
          const seasonConfig = seasonConfigs[futureSeason];

          forecast.push({
            day: futureDay,
            weather,
            highTemp: 22 + seasonConfig.temperatureModifier + config.temperatureModifier + 3,
            lowTemp: 18 + seasonConfig.temperatureModifier + config.temperatureModifier - 3,
            rainChance: ['rainy', 'stormy'].includes(weather) ? 80 :
                        weather === 'cloudy' ? 30 : 10
          });
        }

        set((state) => ({
          weather: { ...state.weather, forecast }
        }));
      },

      updateMarketPrices: (day) => {
        const { market, season } = get();
        if (day === market.lastUpdate) return;

        const seasonConfig = seasonConfigs[season.current];
        const newPrices: Record<string, MarketPrice> = {};

        Object.entries(market.prices).forEach(([cropId, price]) => {
          const volatility = price.volatility;
          const randomChange = (Math.random() - 0.5) * 2 * volatility * 0.1;
          const seasonModifier = seasonConfig.marketPriceModifier;

          // Calculate demand effect
          const demandMultiplier = {
            very_low: 0.7,
            low: 0.85,
            normal: 1.0,
            high: 1.15,
            very_high: 1.3
          }[market.demandLevels[cropId] || 'normal'];

          const newPrice = Math.max(
            price.basePrice * 0.5,
            Math.min(
              price.basePrice * 2,
              price.currentPrice * (1 + randomChange) * seasonModifier * demandMultiplier
            )
          );

          const priceChange = ((newPrice - price.basePrice) / price.basePrice) * 100;
          const trend = priceChange > 5 ? 'rising' : priceChange < -5 ? 'falling' : 'stable';

          newPrices[cropId] = {
            ...price,
            currentPrice: Math.round(newPrice * 100) / 100,
            priceChange: Math.round(priceChange * 10) / 10,
            trend
          };
        });

        // Record history
        const historyEntry = {
          day,
          prices: Object.fromEntries(
            Object.entries(newPrices).map(([id, p]) => [id, p.currentPrice])
          )
        };

        set((state) => ({
          market: {
            ...state.market,
            prices: newPrices,
            priceHistory: [...state.market.priceHistory.slice(-29), historyEntry],
            lastUpdate: day
          }
        }));
      },

      triggerMarketEvent: (cropId, multiplier, duration) => {
        set((state) => ({
          market: {
            ...state.market,
            prices: {
              ...state.market.prices,
              [cropId]: {
                ...state.market.prices[cropId],
                currentPrice: state.market.prices[cropId].basePrice * multiplier,
                priceChange: (multiplier - 1) * 100,
                trend: multiplier > 1 ? 'rising' : 'falling'
              }
            }
          }
        }));
      },

      getCurrentPrice: (cropId) => {
        const { market } = get();
        return market.prices[cropId]?.currentPrice || cropDefinitions[cropId]?.basePrice || 0;
      },

      consumeWater: (liters) => {
        set((state) => ({
          resources: {
            ...state.resources,
            water: {
              ...state.resources.water,
              available: Math.max(0, state.resources.water.available - liters),
              dailyUsage: state.resources.water.dailyUsage + liters
            }
          }
        }));
      },

      consumeNutrients: (n, p, k) => {
        set((state) => ({
          resources: {
            ...state.resources,
            nutrients: {
              ...state.resources.nutrients,
              nitrogen: Math.max(0, state.resources.nutrients.nitrogen - n),
              phosphorus: Math.max(0, state.resources.nutrients.phosphorus - p),
              potassium: Math.max(0, state.resources.nutrients.potassium - k),
              dailyUsage: {
                n: state.resources.nutrients.dailyUsage.n + n,
                p: state.resources.nutrients.dailyUsage.p + p,
                k: state.resources.nutrients.dailyUsage.k + k
              }
            }
          }
        }));
      },

      refillWater: (liters) => {
        set((state) => ({
          resources: {
            ...state.resources,
            water: {
              ...state.resources.water,
              available: Math.min(
                state.resources.water.capacity,
                state.resources.water.available + liters
              )
            }
          }
        }));
      },

      refillNutrients: (n, p, k) => {
        set((state) => ({
          resources: {
            ...state.resources,
            nutrients: {
              ...state.resources.nutrients,
              nitrogen: Math.min(state.resources.nutrients.capacity, state.resources.nutrients.nitrogen + n),
              phosphorus: Math.min(state.resources.nutrients.capacity, state.resources.nutrients.phosphorus + p),
              potassium: Math.min(state.resources.nutrients.capacity, state.resources.nutrients.potassium + k)
            }
          }
        }));
      },

      purchaseResources: (type, amount) => {
        const { resources } = get();
        let cost = 0;

        if (type === 'water') {
          cost = amount * resources.water.costPerLiter;
          get().refillWater(amount);
        } else {
          cost = amount * resources.nutrients.costPerKg;
          get().refillNutrients(amount / 3, amount / 3, amount / 3);
        }

        return cost;
      },

      addPest: (type, cells) => {
        const pest: PestInstance = {
          id: uuidv4(),
          type,
          severity: 20 + Math.random() * 30,
          spreadRate: 0.1 + Math.random() * 0.2,
          affectedCells: cells,
          dayDetected: 0,
          treated: false
        };

        set((state) => ({
          pestDisease: {
            ...state.pestDisease,
            activePests: [...state.pestDisease.activePests, pest]
          }
        }));
      },

      addDisease: (type, cells) => {
        const disease: DiseaseInstance = {
          id: uuidv4(),
          type,
          severity: 15 + Math.random() * 25,
          spreadRate: 0.05 + Math.random() * 0.15,
          affectedCells: cells,
          dayDetected: 0,
          treated: false
        };

        set((state) => ({
          pestDisease: {
            ...state.pestDisease,
            activeDiseases: [...state.pestDisease.activeDiseases, disease]
          }
        }));
      },

      applyTreatment: (treatmentId, targetId) => {
        const { pestDisease } = get();
        const isPest = pestDisease.activePests.some(p => p.id === targetId);
        const effectiveness = Math.random();

        if (isPest) {
          set((state) => ({
            pestDisease: {
              ...state.pestDisease,
              activePests: state.pestDisease.activePests.map(p =>
                p.id === targetId
                  ? { ...p, severity: Math.max(0, p.severity - 50 * effectiveness), treated: true }
                  : p
              ).filter(p => p.severity > 5),
              treatmentHistory: [
                ...state.pestDisease.treatmentHistory,
                {
                  day: 0,
                  treatmentId,
                  targetType: 'pest',
                  targetId,
                  success: effectiveness > 0.5
                }
              ]
            }
          }));
        } else {
          set((state) => ({
            pestDisease: {
              ...state.pestDisease,
              activeDiseases: state.pestDisease.activeDiseases.map(d =>
                d.id === targetId
                  ? { ...d, severity: Math.max(0, d.severity - 40 * effectiveness), treated: true }
                  : d
              ).filter(d => d.severity > 5),
              treatmentHistory: [
                ...state.pestDisease.treatmentHistory,
                {
                  day: 0,
                  treatmentId,
                  targetType: 'disease',
                  targetId,
                  success: effectiveness > 0.5
                }
              ]
            }
          }));
        }

        return effectiveness > 0.5;
      },

      updatePestDisease: () => {
        set((state) => ({
          pestDisease: {
            ...state.pestDisease,
            activePests: state.pestDisease.activePests.map(p => ({
              ...p,
              severity: p.treated ? p.severity * 0.9 : Math.min(100, p.severity * (1 + p.spreadRate))
            })).filter(p => p.severity > 5),
            activeDiseases: state.pestDisease.activeDiseases.map(d => ({
              ...d,
              severity: d.treated ? d.severity * 0.85 : Math.min(100, d.severity * (1 + d.spreadRate))
            })).filter(d => d.severity > 5)
          }
        }));
      },

      inspectFarm: () => {
        set((state) => ({
          pestDisease: {
            ...state.pestDisease,
            lastInspection: Date.now()
          }
        }));
      },

      resetWorld: () => {
        set({
          season: initialSeasonState,
          weather: initialWeatherState,
          market: initialMarketState,
          resources: initialResourceState,
          pestDisease: initialPestDiseaseState
        });
      }
    }),
    {
      name: 'farmiq-world-store',
      partialize: (state) => ({
        season: state.season,
        weather: state.weather,
        market: state.market,
        resources: state.resources,
        pestDisease: state.pestDisease
      })
    }
  )
);
