import { useGameStore } from '../../store/gameStore';
import { useCropStore } from '../../store/cropStore';
import type { GameTime, EnvironmentState, CropInstance, GameEvent } from '../../types';

interface SystemContext {
  gameTime: GameTime;
  environment: EnvironmentState;
  crops: CropInstance[];
}

// Predefined events
const eventTemplates: Omit<GameEvent, 'id' | 'timestamp' | 'isActive'>[] = [
  {
    type: 'disease',
    severity: 'medium',
    title: 'Fungal Infection',
    titleKo: '곰팡이 감염',
    message: 'High humidity has caused fungal growth on some crops.',
    messageKo: '높은 습도로 인해 일부 작물에 곰팡이가 발생했습니다.',
    triggerConditions: [
      { type: 'environment', parameter: 'humidity', operator: 'gt', value: 85, probability: 0.1 }
    ],
    effects: [
      { type: 'damage', target: 'crops', value: 15 }
    ],
    duration: 24,
    preventable: true,
    preventionCost: 50
  },
  {
    type: 'pest',
    severity: 'low',
    title: 'Aphid Infestation',
    titleKo: '진딧물 발생',
    message: 'Aphids have been spotted on your crops.',
    messageKo: '작물에서 진딧물이 발견되었습니다.',
    triggerConditions: [
      { type: 'random', operator: 'gt', value: 0, probability: 0.02 }
    ],
    effects: [
      { type: 'damage', target: 'crops', value: 10 }
    ],
    duration: 12,
    preventable: true,
    preventionCost: 30
  },
  {
    type: 'weather',
    severity: 'high',
    title: 'Heat Wave',
    titleKo: '폭염',
    message: 'Extreme heat is affecting your greenhouse.',
    messageKo: '극심한 더위가 온실에 영향을 미치고 있습니다.',
    triggerConditions: [
      { type: 'environment', parameter: 'temperature', operator: 'gt', value: 35, probability: 0.2 }
    ],
    effects: [
      { type: 'modifier', target: 'environment', value: 5, duration: 6 }
    ],
    duration: 6,
    preventable: false,
    preventionCost: 0
  },
  {
    type: 'market',
    severity: 'low',
    title: 'Market Boom',
    titleKo: '시장 호황',
    message: 'Crop prices have increased temporarily!',
    messageKo: '작물 가격이 일시적으로 상승했습니다!',
    triggerConditions: [
      { type: 'random', operator: 'gt', value: 0, probability: 0.05 }
    ],
    effects: [
      { type: 'bonus', target: 'money', value: 1.2 }
    ],
    duration: 48,
    preventable: false,
    preventionCost: 0
  },
  {
    type: 'equipment_failure',
    severity: 'medium',
    title: 'Equipment Malfunction',
    titleKo: '장비 오작동',
    message: 'One of your equipment has temporarily malfunctioned.',
    messageKo: '장비 중 하나가 일시적으로 오작동했습니다.',
    triggerConditions: [
      { type: 'random', operator: 'gt', value: 0, probability: 0.01 }
    ],
    effects: [
      { type: 'cost', target: 'money', value: 100 }
    ],
    duration: 4,
    preventable: false,
    preventionCost: 0
  }
];

export class EventSystem {
  private activeEvents: Map<string, GameEvent> = new Map();
  private lastEventCheck = 0;
  private readonly EVENT_CHECK_INTERVAL = 60; // Check every 60 ticks (1 game hour)

  update(context: SystemContext): void {
    this.lastEventCheck++;

    // Only check for new events periodically
    if (this.lastEventCheck < this.EVENT_CHECK_INTERVAL) {
      return;
    }
    this.lastEventCheck = 0;

    const gameStore = useGameStore.getState();
    const cropStore = useCropStore.getState();

    // Check each event template
    for (const template of eventTemplates) {
      // Check if conditions are met
      if (this.checkEventConditions(template, context)) {
        // Create event instance
        const eventId = `${template.type}-${Date.now()}`;
        const event: GameEvent = {
          ...template,
          id: eventId,
          timestamp: Date.now(),
          isActive: true
        };

        // Add to active events
        this.activeEvents.set(eventId, event);

        // Apply immediate effects
        this.applyEventEffects(event, context);

        // Notify player
        gameStore.addNotification({
          type: event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'info',
          title: event.titleKo,
          message: event.messageKo
        });

        // Schedule event end
        setTimeout(() => {
          this.activeEvents.delete(eventId);
        }, event.duration * 60000); // duration is in game hours, convert to real ms
      }
    }

    // Update active events and apply ongoing effects
    this.updateActiveEvents(context);
  }

  private checkEventConditions(
    event: typeof eventTemplates[0],
    context: SystemContext
  ): boolean {
    for (const condition of event.triggerConditions) {
      // Check probability first
      if (condition.probability !== undefined) {
        if (Math.random() > condition.probability) {
          return false;
        }
      }

      // Check condition type
      switch (condition.type) {
        case 'random':
          // Already handled by probability
          break;

        case 'environment':
          if (condition.parameter) {
            const value = context.environment[condition.parameter as keyof EnvironmentState];
            if (typeof value === 'number') {
              switch (condition.operator) {
                case 'gt':
                  if (value <= (condition.value as number)) return false;
                  break;
                case 'lt':
                  if (value >= (condition.value as number)) return false;
                  break;
                case 'eq':
                  if (value !== condition.value) return false;
                  break;
                case 'between':
                  if (Array.isArray(condition.value)) {
                    const [min, max] = condition.value;
                    if (value < min || value > max) return false;
                  }
                  break;
              }
            }
          }
          break;

        case 'crop':
          // Check if there are crops
          if (context.crops.length === 0) return false;
          break;

        case 'time':
          // Could add time-based conditions
          break;
      }
    }

    return true;
  }

  private applyEventEffects(event: GameEvent, context: SystemContext): void {
    const cropStore = useCropStore.getState();

    for (const effect of event.effects) {
      switch (effect.type) {
        case 'damage':
          if (effect.target === 'crops') {
            // Apply damage to all crops
            for (const crop of context.crops) {
              const newHealth = Math.max(0, crop.health - effect.value);
              cropStore.updateCropHealth(crop.instanceId, newHealth);
            }
          }
          break;

        case 'bonus':
          // Handled at harvest time
          break;

        case 'cost':
          // Immediate cost deduction handled elsewhere
          break;

        case 'modifier':
          // Environmental modifiers handled by environment system
          break;
      }
    }
  }

  private updateActiveEvents(context: SystemContext): void {
    // Process ongoing effects of active events
    for (const [eventId, event] of this.activeEvents) {
      // Check if event should expire
      const elapsed = Date.now() - event.timestamp;
      const durationMs = event.duration * 60000;

      if (elapsed >= durationMs) {
        this.activeEvents.delete(eventId);
      }
    }
  }

  getActiveEvents(): GameEvent[] {
    return Array.from(this.activeEvents.values());
  }
}
