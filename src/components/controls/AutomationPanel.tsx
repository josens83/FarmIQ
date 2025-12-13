import React, { useState } from 'react';
import { Cpu, Plus, Trash2, Power, Edit2 } from 'lucide-react';
import { useEquipmentStore } from '../../store/equipmentStore';
import { usePlayerStore } from '../../store/playerStore';
import { equipmentDefinitions } from '../../data/equipment';
import { Button, Card, Modal } from '../common';
import type { AutomationRule, SensorType, AutomationCondition, AutomationAction } from '../../types';

export const AutomationPanel: React.FC = () => {
  const { automationRules, equipment, addAutomationRule, removeAutomationRule, toggleAutomationRule } = useEquipmentStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const getSensorLabel = (type: SensorType): string => {
    const labels: Record<SensorType, string> = {
      temperature: '온도',
      humidity: '습도',
      co2: 'CO2',
      light: '광량',
      soil: '토양 수분',
      ph: 'pH',
      ec: 'EC'
    };
    return labels[type];
  };

  const getConditionLabel = (condition: AutomationCondition): string => {
    const labels: Record<AutomationCondition, string> = {
      above: '초과 시',
      below: '미만 시',
      between: '범위 내'
    };
    return labels[condition];
  };

  const getEquipmentName = (equipmentId: string): string => {
    const eq = equipment.find(e => e.id === equipmentId);
    if (!eq) return '알 수 없음';
    const def = equipmentDefinitions[eq.definitionId];
    return def?.nameKo || '알 수 없음';
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-slate-400" />
          자동화 규칙
        </h3>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          추가
        </Button>
      </div>

      {automationRules.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>자동화 규칙이 없습니다.</p>
          <p className="text-sm mt-1">규칙을 추가하여 장비를 자동으로 제어하세요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {automationRules.map((rule) => (
            <Card key={rule.id} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${rule.isEnabled ? 'text-white' : 'text-slate-500'}`}>
                      {rule.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      rule.isEnabled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}>
                      {rule.isEnabled ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {getSensorLabel(rule.sensorType)} {typeof rule.threshold === 'number' ? rule.threshold : `${rule.threshold[0]}-${rule.threshold[1]}`} {getConditionLabel(rule.condition)} →{' '}
                    {getEquipmentName(rule.equipmentId)} {rule.action === 'activate' ? '켜기' : '끄기'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomationRule(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rule.isEnabled
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeAutomationRule(rule.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="자동화 규칙 추가"
        size="md"
      >
        <AddRuleForm
          equipment={equipment}
          onSubmit={(rule) => {
            addAutomationRule(rule);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};

interface AddRuleFormProps {
  equipment: any[];
  onSubmit: (rule: Omit<AutomationRule, 'id'>) => void;
  onCancel: () => void;
}

const AddRuleForm: React.FC<AddRuleFormProps> = ({ equipment, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [sensorType, setSensorType] = useState<SensorType>('temperature');
  const [condition, setCondition] = useState<AutomationCondition>('above');
  const [threshold, setThreshold] = useState(25);
  const [equipmentId, setEquipmentId] = useState('');
  const [action, setAction] = useState<AutomationAction>('activate');

  const handleSubmit = () => {
    if (!name || !equipmentId) return;

    onSubmit({
      name,
      sensorType,
      condition,
      threshold,
      equipmentId,
      action,
      priority: 1,
      isEnabled: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Rule Name */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">규칙 이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="예: 온도 높을 때 냉각"
        />
      </div>

      {/* Sensor Type */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">센서 유형</label>
        <select
          value={sensorType}
          onChange={(e) => setSensorType(e.target.value as SensorType)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="temperature">온도</option>
          <option value="humidity">습도</option>
          <option value="co2">CO2</option>
          <option value="light">광량</option>
          <option value="soil">토양 수분</option>
          <option value="ph">pH</option>
          <option value="ec">EC</option>
        </select>
      </div>

      {/* Condition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">조건</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AutomationCondition)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="above">초과 시</option>
            <option value="below">미만 시</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">임계값</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Equipment */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">제어할 장비</label>
        <select
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">장비 선택...</option>
          {equipment.map((eq) => {
            const def = equipmentDefinitions[eq.definitionId];
            return (
              <option key={eq.id} value={eq.id}>
                {def?.nameKo || eq.id}
              </option>
            );
          })}
        </select>
      </div>

      {/* Action */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">동작</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as AutomationAction)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="activate">켜기</option>
          <option value="deactivate">끄기</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!name || !equipmentId}>
          추가
        </Button>
      </div>
    </div>
  );
};
