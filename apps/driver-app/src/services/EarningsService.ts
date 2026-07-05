export class EarningsService {
  static async getWeeklyEarnings() {
    // Stub implementation for T012 and T014
    return {
      total: 450.50,
      basePay: 300.00,
      tips: 100.50,
      bonuses: 50.00,
      period: 'Oct 23 - Oct 29'
    };
  }
}
