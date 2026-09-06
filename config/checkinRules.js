// config/checkinRules.js
// 签到阶梯送豆与补签规则配置

module.exports = {
  // 前5天梯度递增，第5天及以后保持一致
  DAILY_REWARDS: {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50
  },
  MAX_REWARD: 50, // 超过5天后每天固定送豆数

  /**
   * 根据连续签到天数计算今日应得豆数
   * @param {number} continuousDays 连续签到天数 (从 1 开始)
   */
  getRewardBeads(continuousDays) {
    if (continuousDays <= 0) return this.DAILY_REWARDS[1];
    return this.DAILY_REWARDS[continuousDays] || this.MAX_REWARD;
  }
};