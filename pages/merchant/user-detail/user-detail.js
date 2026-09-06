const api = require('../../../utils/api.js');

Page({
  data: {
    phone: '',
    player: {},
    stats: { totalSpent: '0.0', totalOrders: 0, verifiedCount: 0, historyPackages: [] },
    orders: []
  },

  onLoad(options) {
    if (options.phone) {
      this.setData({ phone: decodeURIComponent(options.phone) });
      this.fetchUserDetail();
    }
  },

  fetchUserDetail() {
    wx.showLoading({ title: '加载资料...' });
    api.getPlayerDetail(this.data.phone).then(res => {
      wx.hideLoading();
      this.setData({
        player: res.player,
        stats: res.stats,
        orders: res.orders
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '拉取失败', icon: 'none' });
    });
  },

  // 1. 用户画像专属券派发
  giveExclusiveCoupon() {
    const { player, stats } = this.data;
    if (!player || !player.phone) return;

    let couponTitle = '';
    let couponDiscount = 90;

    if (stats.verifiedCount === 0) {
      couponTitle = '首单体验立减 5 元券';
      couponDiscount = 90;
    } else if (stats.verifiedCount >= 3 || Number(stats.totalSpent) >= 100) {
      couponTitle = '高频VIP专属 75折 狂欢券';
      couponDiscount = 75;
    } else {
      couponTitle = '进阶立体套餐 85折 优惠券';
      couponDiscount = 85;
    }

    wx.showLoading({ title: '派发中...' });
    api.sendCoupon({
      user_phone: player.phone,
      title: couponTitle,
      discount_val: couponDiscount,
      target_pkg: stats.historyPackages[0] || '全场通用',
      expire_days: 30
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: `已成功派发: ${couponTitle}`, icon: 'none', duration: 2500 });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '派发失败', icon: 'none' });
    });
  },

  // 2. 办理部分/二次退款 (自动扣除累计已退)
  handleDetailRefund(e) {
    const item = e.currentTarget.dataset.item;
    const amount = Number(item.amount) || 0;
    const refunded = Number(item.refunded_amount || item.refundedAmount) || 0;
    const maxRefund = Number((amount - refunded).toFixed(1));

    if (maxRefund <= 0) return wx.showToast({ title: '已无可退金额', icon: 'none' });

    const modalTitle = refunded > 0 
      ? `办理退款 (原付￥${amount}, 已退￥${refunded})` 
      : `办理退款 (实付￥${amount})`;

    wx.showModal({
      title: modalTitle,
      editable: true,
      content: String(maxRefund), // 默认填入剩余全款纯数字
      placeholderText: `最多可退 ￥${maxRefund}`,
      confirmText: '确定退款',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          const inputVal = (res.content || '').trim();
          const val = parseFloat(inputVal);
          if (isNaN(val) || val <= 0 || val > maxRefund) {
            return wx.showToast({ title: `金额需介于 0.1 ~ ${maxRefund}`, icon: 'none' });
          }
          wx.showLoading({ title: '处理退款中...' });
          api.refundBooking(item.id, val).then(() => {
            wx.hideLoading();
            wx.showToast({ title: `已退款 ￥${val}`, icon: 'success' });
            this.fetchUserDetail();
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '退款失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 3. 直接核销当前单
  handleDetailVerify(e) {
    const code = e.currentTarget.dataset.code;
    wx.showModal({
      title: '确认核销',
      content: `确认核销预约码【${code}】吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '核销中...' });
          api.verifyCode(code).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '核销成功', icon: 'success' });
            this.fetchUserDetail(); // 刷新详情
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '核销失败', icon: 'none' });
          });
        }
      }
    });
  }
});