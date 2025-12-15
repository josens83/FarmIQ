import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWorldStore } from '../../store';
import { weatherConfigs } from '../../data/weather';
import { seasonConfigs } from '../../data/seasons';
import { Card } from '../common/Card';

export const WeatherDisplay = memo(function WeatherDisplay() {
  const { t, i18n } = useTranslation();
  const { weather, season } = useWorldStore();
  const isKorean = i18n.language === 'ko';

  const currentWeather = weatherConfigs[weather.current];
  const currentSeason = seasonConfigs[season.current];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          {isKorean ? '날씨 & 계절' : 'Weather & Season'}
        </h3>
        <span className="text-2xl">{currentWeather.icon}</span>
      </div>

      {/* Current Weather */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {currentWeather.icon}
        </motion.div>
        <div>
          <p className="font-medium">
            {isKorean ? currentWeather.nameKo : currentWeather.name}
          </p>
          <p className="text-sm text-gray-500">
            {isKorean ? currentWeather.descriptionKo : currentWeather.description}
          </p>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="text-lg">🌡️</span>
          <p className="text-sm font-medium">{Math.round(weather.temperature)}°C</p>
          <p className="text-xs text-gray-500">{isKorean ? '온도' : 'Temp'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="text-lg">💧</span>
          <p className="text-sm font-medium">{Math.round(weather.humidity)}%</p>
          <p className="text-xs text-gray-500">{isKorean ? '습도' : 'Humidity'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="text-lg">💨</span>
          <p className="text-sm font-medium">{weather.windSpeed} km/h</p>
          <p className="text-xs text-gray-500">{isKorean ? '풍속' : 'Wind'}</p>
        </div>
      </div>

      {/* Season Info */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {isKorean ? currentSeason.nameKo : currentSeason.name}
          </span>
          <span className="text-sm font-medium">
            {isKorean ? '년' : 'Year'} {season.year} - {isKorean ? '일' : 'Day'} {season.dayOfSeason}/{season.daysPerSeason}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{
              backgroundColor:
                season.current === 'spring' ? '#22c55e' :
                season.current === 'summer' ? '#eab308' :
                season.current === 'fall' ? '#f97316' : '#3b82f6',
              width: `${(season.dayOfSeason / season.daysPerSeason) * 100}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(season.dayOfSeason / season.daysPerSeason) * 100}%` }}
          />
        </div>
      </div>

      {/* Season Effects */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>{isKorean ? '성장률' : 'Growth'}</span>
          <span className={currentSeason.growthRateModifier >= 1 ? 'text-green-600' : 'text-red-600'}>
            {currentSeason.growthRateModifier >= 1 ? '+' : ''}{Math.round((currentSeason.growthRateModifier - 1) * 100)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isKorean ? '시장 가격' : 'Market'}</span>
          <span className={currentSeason.marketPriceModifier >= 1 ? 'text-green-600' : 'text-red-600'}>
            {currentSeason.marketPriceModifier >= 1 ? '+' : ''}{Math.round((currentSeason.marketPriceModifier - 1) * 100)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isKorean ? '에너지 비용' : 'Energy'}</span>
          <span className={currentSeason.energyCostModifier <= 1 ? 'text-green-600' : 'text-red-600'}>
            {currentSeason.energyCostModifier >= 1 ? '+' : ''}{Math.round((currentSeason.energyCostModifier - 1) * 100)}%
          </span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {weather.forecast.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium mb-2">
            {isKorean ? '5일 예보' : '5-Day Forecast'}
          </p>
          <div className="flex gap-2">
            {weather.forecast.slice(0, 5).map((day, idx) => (
              <div key={idx} className="flex-1 text-center p-1 bg-gray-50 rounded text-xs">
                <p className="font-medium">D{day.day}</p>
                <span className="text-lg">{weatherConfigs[day.weather].icon}</span>
                <p>{day.highTemp}°/{day.lowTemp}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
});
