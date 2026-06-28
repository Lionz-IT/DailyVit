const { generateSmartInsight } = require('../src/services/ruleEngine');

describe('ruleEngine', () => {
  describe('generateSmartInsight', () => {
    const baseline = { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };

    it('returns an object with trendDeviation, healthStatus, and dailyTarget', () => {
      const summary = { total_steps: 7000, avg_heart_rate: 75, total_calories: 450 };
      const result = generateSmartInsight(summary, baseline);
      expect(result).toHaveProperty('trendDeviation');
      expect(result).toHaveProperty('healthStatus');
      expect(result).toHaveProperty('dailyTarget');
      expect(result.trendDeviation).toHaveProperty('en');
      expect(result.trendDeviation).toHaveProperty('id');
      expect(result.healthStatus).toHaveProperty('en');
      expect(result.healthStatus).toHaveProperty('id');
      expect(result.dailyTarget).toHaveProperty('en');
      expect(result.dailyTarget).toHaveProperty('id');
    });

    it('warns when activity is significantly below baseline (stepRatio < 0.5)', () => {
      const summary = { total_steps: 1000, avg_heart_rate: 95, total_calories: 100 };
      const result = generateSmartInsight(summary, baseline);
      expect(result.trendDeviation.en).toContain('significantly below baseline');
      expect(result.trendDeviation.id).toContain('jauh di bawah');
    });

    it('warns when heart rate is elevated (hrRatio > 1.1)', () => {
      const summary = { total_steps: 1000, avg_heart_rate: 95, total_calories: 100 };
      const result = generateSmartInsight(summary, baseline);
      expect(result.healthStatus.en).toContain('elevated');
      expect(result.healthStatus.id).toContain('meningkat');
    });

    it('congratulates when activity is well above baseline (stepRatio >= 1.2)', () => {
      const summary = { total_steps: 10000, avg_heart_rate: 78, total_calories: 500 };
      const result = generateSmartInsight(summary, baseline);
      expect(result.trendDeviation.en).toContain('well above');
      expect(result.trendDeviation.id).toContain('jauh di atas');
    });

    it('reports normal trend when activity is within range (0.5 <= stepRatio < 1.2)', () => {
      const summary = { total_steps: 7500, avg_heart_rate: 75, total_calories: 460 };
      const result = generateSmartInsight(summary, baseline);
      expect(result.trendDeviation.en).toContain('normal');
      expect(result.healthStatus.en).toContain('normal');
    });

    it('reports normal heart rate when hrRatio <= 1.1', () => {
      const summary = { total_steps: 5500, avg_heart_rate: 73, total_calories: 400 };
      const result = generateSmartInsight(summary, baseline);
      expect(result.healthStatus.en).toContain('normal');
      expect(result.healthStatus.id).toContain('normal');
    });

    it('calculates daily target as 105% of baseline steps clamped to 3000-15000', () => {
      const summary = { total_steps: 7000, avg_heart_rate: 75, total_calories: 450 };
      const result = generateSmartInsight(summary, baseline);
      // 7000 * 1.05 = 7350
      expect(result.dailyTarget.en).toContain('7350');
      expect(result.dailyTarget.id).toContain('7350');
    });

    it('clamps daily target to minimum 3000 for very low baselines', () => {
      const lowBaseline = { avg_steps: 1000, avg_heart_rate: 75, avg_calories: 450 };
      const summary = { total_steps: 500, avg_heart_rate: 70, total_calories: 100 };
      const result = generateSmartInsight(summary, lowBaseline);
      // 1000 * 1.05 = 1050 < 3000 → clamped to 3000
      expect(result.dailyTarget.en).toContain('3000');
    });

    it('clamps daily target to maximum 15000 for very high baselines', () => {
      const highBaseline = { avg_steps: 20000, avg_heart_rate: 75, avg_calories: 450 };
      const summary = { total_steps: 18000, avg_heart_rate: 70, total_calories: 600 };
      const result = generateSmartInsight(summary, highBaseline);
      // 20000 * 1.05 = 21000 > 15000 → clamped to 15000
      expect(result.dailyTarget.en).toContain('15000');
    });
  });
});
