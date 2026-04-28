const { cleanSteps, cleanHeartRate, cleanCalories } = require('../src/services/dataCleansing');

describe('dataCleansing', () => {
  describe('cleanSteps', () => {
    it('keeps valid step values (0-50000)', () => {
      const input = [{ steps: 0 }, { steps: 500 }, { steps: 50000 }];
      expect(cleanSteps(input)).toEqual(input);
    });

    it('removes negative steps', () => {
      const input = [{ steps: -1 }, { steps: 100 }];
      expect(cleanSteps(input)).toEqual([{ steps: 100 }]);
    });

    it('removes steps exceeding 50000', () => {
      const input = [{ steps: 50001 }, { steps: 200 }];
      expect(cleanSteps(input)).toEqual([{ steps: 200 }]);
    });
  });

  describe('cleanHeartRate', () => {
    it('keeps valid heart rate values (30-220)', () => {
      const input = [{ hr: 30 }, { hr: 75 }, { hr: 220 }];
      expect(cleanHeartRate(input)).toEqual(input);
    });

    it('removes heart rate below 30', () => {
      const input = [{ hr: 29 }, { hr: 80 }];
      expect(cleanHeartRate(input)).toEqual([{ hr: 80 }]);
    });

    it('removes heart rate above 220', () => {
      const input = [{ hr: 221 }, { hr: 90 }];
      expect(cleanHeartRate(input)).toEqual([{ hr: 90 }]);
    });
  });

  describe('cleanCalories', () => {
    it('keeps valid calorie values (0-5000)', () => {
      const input = [{ cal: 0 }, { cal: 100 }, { cal: 5000 }];
      expect(cleanCalories(input)).toEqual(input);
    });

    it('removes negative calories', () => {
      const input = [{ cal: -5 }, { cal: 50 }];
      expect(cleanCalories(input)).toEqual([{ cal: 50 }]);
    });

    it('removes calories exceeding 5000', () => {
      const input = [{ cal: 5001 }, { cal: 200 }];
      expect(cleanCalories(input)).toEqual([{ cal: 200 }]);
    });
  });
});
