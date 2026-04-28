const {
  aggregateDailySteps,
  aggregateDailyHeartRate,
  aggregateDailyCalories,
  buildHourlyTrend
} = require('../src/services/dataAggregation');

describe('dataAggregation', () => {
  describe('aggregateDailySteps', () => {
    it('sums all hourly steps', () => {
      const input = [{ steps: 100 }, { steps: 200 }, { steps: 300 }];
      expect(aggregateDailySteps(input)).toBe(600);
    });

    it('returns 0 for empty array', () => {
      expect(aggregateDailySteps([])).toBe(0);
    });
  });

  describe('aggregateDailyHeartRate', () => {
    it('averages non-zero heart rate readings', () => {
      const input = [{ hr: 70 }, { hr: 80 }, { hr: 0 }];
      expect(aggregateDailyHeartRate(input)).toBe(75);
    });

    it('returns 0 when all readings are zero', () => {
      const input = [{ hr: 0 }, { hr: 0 }];
      expect(aggregateDailyHeartRate(input)).toBe(0);
    });

    it('returns 0 for empty array', () => {
      expect(aggregateDailyHeartRate([])).toBe(0);
    });
  });

  describe('aggregateDailyCalories', () => {
    it('sums all hourly calories', () => {
      const input = [{ cal: 10.5 }, { cal: 20.3 }];
      expect(aggregateDailyCalories(input)).toBe(30.8);
    });

    it('returns 0 for empty array', () => {
      expect(aggregateDailyCalories([])).toBe(0);
    });
  });

  describe('buildHourlyTrend', () => {
    it('produces 24 hourly entries', () => {
      const steps = [{ hour: 8, steps: 500 }];
      const hr = [{ hour: 8, hr: 75 }];
      const cal = [{ hour: 8, cal: 30 }];
      const result = buildHourlyTrend(steps, hr, cal);

      expect(result).toHaveLength(24);
      expect(result[8]).toEqual({
        hour: 8,
        label: '08:00',
        steps: 500,
        heartRate: 75,
        calories: 30
      });
      expect(result[0]).toEqual({
        hour: 0,
        label: '00:00',
        steps: 0,
        heartRate: 0,
        calories: 0
      });
    });
  });
});
