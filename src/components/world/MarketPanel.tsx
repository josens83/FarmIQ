import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorldStore } from '../../store';
import { cropDefinitions } from '../../data/crops';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

type SortBy = 'name' | 'price' | 'change';
type FilterBy = 'all' | 'rising' | 'falling' | 'stable';

export const MarketPanel = memo(function MarketPanel() {
  const { i18n } = useTranslation();
  const { market } = useWorldStore();
  const isKorean = i18n.language === 'ko';

  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showHistory, setShowHistory] = useState(false);

  const sortedPrices = Object.values(market.prices)
    .filter(p => filterBy === 'all' || p.trend === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'change':
          return b.priceChange - a.priceChange;
        default:
          return a.cropId.localeCompare(b.cropId);
      }
    });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {isKorean ? '시장 가격' : 'Market Prices'}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? (isKorean ? '목록' : 'List') : (isKorean ? '추이' : 'Trends')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select
          className="text-sm border rounded px-2 py-1"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label={isKorean ? '정렬 기준' : 'Sort by'}
        >
          <option value="name">{isKorean ? '이름순' : 'Name'}</option>
          <option value="price">{isKorean ? '가격순' : 'Price'}</option>
          <option value="change">{isKorean ? '변동순' : 'Change'}</option>
        </select>
        <select
          className="text-sm border rounded px-2 py-1"
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as FilterBy)}
          aria-label={isKorean ? '필터' : 'Filter'}
        >
          <option value="all">{isKorean ? '전체' : 'All'}</option>
          <option value="rising">{isKorean ? '상승' : 'Rising'}</option>
          <option value="falling">{isKorean ? '하락' : 'Falling'}</option>
          <option value="stable">{isKorean ? '안정' : 'Stable'}</option>
        </select>
      </div>

      <AnimatePresence mode="wait">
        {!showHistory ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 max-h-80 overflow-y-auto"
          >
            {sortedPrices.map((price) => {
              const crop = cropDefinitions[price.cropId];
              if (!crop) return null;

              return (
                <motion.div
                  key={price.cropId}
                  layout
                  className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{crop.sprites.harvest}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {isKorean ? crop.nameKo : crop.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isKorean ? '기본가' : 'Base'}: ${price.basePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${price.currentPrice.toFixed(2)}</p>
                    <p className={`text-xs flex items-center gap-1 ${getTrendColor(price.priceChange)}`}>
                      {getTrendIcon(price.trend)}
                      {price.priceChange > 0 ? '+' : ''}{price.priceChange.toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {market.priceHistory.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">
                  {isKorean ? '최근 가격 기록' : 'Recent Price History'}
                </p>
                <div className="h-40 flex items-end gap-1">
                  {market.priceHistory.slice(-20).map((entry, idx) => {
                    const avgPrice = Object.values(entry.prices).reduce((a, b) => a + b, 0) / Object.values(entry.prices).length;
                    const maxPrice = 15;
                    const height = (avgPrice / maxPrice) * 100;

                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`Day ${entry.day}: $${avgPrice.toFixed(2)} avg`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-center text-gray-500">
                  {isKorean ? '평균 가격 추이 (최근 20일)' : 'Average price trend (last 20 days)'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                {isKorean ? '가격 기록이 없습니다' : 'No price history yet'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Summary */}
      <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-green-600">
            {sortedPrices.filter(p => p.trend === 'rising').length}
          </p>
          <p className="text-xs text-gray-500">{isKorean ? '상승' : 'Rising'}</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-600">
            {sortedPrices.filter(p => p.trend === 'stable').length}
          </p>
          <p className="text-xs text-gray-500">{isKorean ? '안정' : 'Stable'}</p>
        </div>
        <div>
          <p className="text-lg font-bold text-red-600">
            {sortedPrices.filter(p => p.trend === 'falling').length}
          </p>
          <p className="text-xs text-gray-500">{isKorean ? '하락' : 'Falling'}</p>
        </div>
      </div>
    </Card>
  );
});
