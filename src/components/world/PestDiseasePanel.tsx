import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorldStore, usePlayerStore } from '../../store';
import { treatmentOptions } from '../../data/weather';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { PestType, DiseaseType } from '../../types';

const pestInfo: Record<PestType, { name: string; nameKo: string; icon: string }> = {
  aphids: { name: 'Aphids', nameKo: '진딧물', icon: '🐛' },
  spider_mites: { name: 'Spider Mites', nameKo: '응애', icon: '🕷️' },
  whiteflies: { name: 'Whiteflies', nameKo: '가루이', icon: '🪰' },
  thrips: { name: 'Thrips', nameKo: '총채벌레', icon: '🦟' },
  fungus_gnats: { name: 'Fungus Gnats', nameKo: '버섯파리', icon: '🪳' }
};

const diseaseInfo: Record<DiseaseType, { name: string; nameKo: string; icon: string }> = {
  powdery_mildew: { name: 'Powdery Mildew', nameKo: '흰가루병', icon: '🍄' },
  botrytis: { name: 'Botrytis (Gray Mold)', nameKo: '잿빛곰팡이병', icon: '🦠' },
  root_rot: { name: 'Root Rot', nameKo: '뿌리썩음병', icon: '🪴' },
  leaf_spot: { name: 'Leaf Spot', nameKo: '잎반점병', icon: '🍂' },
  damping_off: { name: 'Damping Off', nameKo: '모잘록병', icon: '🌱' }
};

export const PestDiseasePanel = memo(function PestDiseasePanel() {
  const { i18n } = useTranslation();
  const { pestDisease, applyTreatment, inspectFarm } = useWorldStore();
  const { money, spendMoney } = usePlayerStore();
  const isKorean = i18n.language === 'ko';

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showTreatments, setShowTreatments] = useState(false);

  const handleTreatment = (treatmentId: string, targetId: string) => {
    const treatment = treatmentOptions.find(t => t.id === treatmentId);
    if (!treatment || money < treatment.cost) return;

    const success = applyTreatment(treatmentId, targetId);
    spendMoney(treatment.cost);
    setSelectedTarget(null);
    setShowTreatments(false);
  };

  const getSeverityColor = (severity: number) => {
    if (severity < 30) return 'text-yellow-600';
    if (severity < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityBgColor = (severity: number) => {
    if (severity < 30) return 'bg-yellow-100';
    if (severity < 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const allThreats = [
    ...pestDisease.activePests.map(p => ({ ...p, category: 'pest' as const, info: pestInfo[p.type] })),
    ...pestDisease.activeDiseases.map(d => ({ ...d, category: 'disease' as const, info: diseaseInfo[d.type] }))
  ];

  const availableTreatments = selectedTarget
    ? treatmentOptions.filter(t => {
        const target = allThreats.find(th => th.id === selectedTarget);
        if (!target) return false;
        if (target.category === 'pest') {
          return t.targetPests?.includes(target.type as PestType);
        }
        return t.targetDiseases?.includes(target.type as DiseaseType);
      })
    : [];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {isKorean ? '병해충 관리' : 'Pest & Disease'}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-2 py-1 rounded ${
            pestDisease.preventionLevel > 70 ? 'bg-green-100 text-green-700' :
            pestDisease.preventionLevel > 40 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {isKorean ? '방역' : 'Prevention'}: {pestDisease.preventionLevel}%
          </span>
        </div>
      </div>

      {/* Inspection Button */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full mb-4"
        onClick={inspectFarm}
      >
        🔍 {isKorean ? '농장 점검하기' : 'Inspect Farm'}
      </Button>

      {/* Active Threats */}
      {allThreats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl">✅</span>
          <p className="mt-2">
            {isKorean ? '현재 병해충이 없습니다' : 'No active pests or diseases'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {allThreats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 rounded ${getSeverityBgColor(threat.severity)} cursor-pointer hover:opacity-90`}
                onClick={() => {
                  setSelectedTarget(threat.id);
                  setShowTreatments(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{threat.info.icon}</span>
                    <div>
                      <p className="font-medium">
                        {isKorean ? threat.info.nameKo : threat.info.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {threat.category === 'pest'
                          ? (isKorean ? '해충' : 'Pest')
                          : (isKorean ? '질병' : 'Disease')}
                        {threat.treated && (
                          <span className="ml-2 text-blue-600">
                            {isKorean ? '(치료중)' : '(Treated)'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getSeverityColor(threat.severity)}`}>
                      {Math.round(threat.severity)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {isKorean ? '심각도' : 'Severity'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-white rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      threat.severity < 30 ? 'bg-yellow-500' :
                      threat.severity < 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${threat.severity}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Treatment Modal */}
      <AnimatePresence>
        {showTreatments && selectedTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTreatments(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-4 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-semibold mb-4">
                {isKorean ? '치료 옵션 선택' : 'Select Treatment'}
              </h4>

              {availableTreatments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {isKorean ? '사용 가능한 치료법이 없습니다' : 'No treatments available'}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {isKorean ? treatment.nameKo : treatment.name}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            treatment.type === 'organic'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {treatment.type === 'organic'
                              ? (isKorean ? '유기농' : 'Organic')
                              : (isKorean ? '화학' : 'Chemical')}
                          </span>
                        </div>
                        <span className="font-bold">${treatment.cost}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {isKorean ? '효과' : 'Effectiveness'}: {(treatment.effectiveness * 100).toFixed(0)}%
                      </p>
                      {treatment.sideEffects && treatment.sideEffects.length > 0 && (
                        <p className="text-xs text-orange-600 mb-2">
                          ⚠️ {isKorean ? '부작용 있음' : 'Has side effects'}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={money < treatment.cost}
                        onClick={() => handleTreatment(treatment.id, selectedTarget)}
                      >
                        {isKorean ? '적용하기' : 'Apply'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => setShowTreatments(false)}
              >
                {isKorean ? '닫기' : 'Close'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Treatment History */}
      {pestDisease.treatmentHistory.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm font-medium mb-2">
            {isKorean ? '최근 치료 기록' : 'Recent Treatments'}
          </p>
          <div className="space-y-1">
            {pestDisease.treatmentHistory.slice(-3).reverse().map((record, idx) => {
              const treatment = treatmentOptions.find(t => t.id === record.treatmentId);
              return (
                <div key={idx} className="text-xs flex justify-between text-gray-600">
                  <span>
                    {treatment ? (isKorean ? treatment.nameKo : treatment.name) : record.treatmentId}
                  </span>
                  <span className={record.success ? 'text-green-600' : 'text-red-600'}>
                    {record.success ? (isKorean ? '성공' : 'Success') : (isKorean ? '실패' : 'Failed')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
});
