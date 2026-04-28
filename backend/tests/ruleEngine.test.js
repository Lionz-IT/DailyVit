const { generateSmartInsight } = require('../src/services/ruleEngine');

describe('ruleEngine', () => {
  describe('generateSmartInsight', () => {
    const baseline = { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };

    it('warns when activity very low and heart rate high', () => {
      const summary = { total_steps: 1000, avg_heart_rate: 95, total_calories: 100 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('⚠️');
    });

    it('suggests movement when steps are very low', () => {
      const summary = { total_steps: 2000, avg_heart_rate: 70, total_calories: 200 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('🪑');
    });

    it('congratulates when steps exceed target significantly', () => {
      const summary = { total_steps: 10000, avg_heart_rate: 78, total_calories: 500 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('🌟');
    });

    it('confirms on-target activity', () => {
      const summary = { total_steps: 7500, avg_heart_rate: 75, total_calories: 460 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('✅');
    });

    it('suggests improvement when slightly below average', () => {
      const summary = { total_steps: 4000, avg_heart_rate: 72, total_calories: 300 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('📈');
    });

    it('returns default positive message for normal activity', () => {
      const summary = { total_steps: 5500, avg_heart_rate: 73, total_calories: 400 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toContain('😊');
    });
  });
});
