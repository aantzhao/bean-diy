// config/promoRules.js
// 优惠券推送时效与裂变赠豆规则

module.exports = {
  // 优惠券有效期配置
  COUPON_EXPIRATION: {
    NEW_USER: null,         // 新人专属券：无期限 (永久有效)
    PUSH_PROMO_DAYS: 30     // 运营后台/系统自动推送的优惠券：1个月 (30天)
  },

  // 裂变与邀请规则
  INVITATION: {
    INVITER_BEADS: 100,     // 邀请者获得豆数
    INVITEE_BEADS: 100      // 受邀新用户额外获得豆数
  },

  /**
   * 判定某张卡券当前是否已过期
   * @param {number|null} expireAt 到期毫秒时间戳
   */
  isCouponExpired(expireAt) {
    if (!expireAt) return false; // null 代表永久有效
    return Date.now() > expireAt;
  }
};