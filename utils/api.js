// utils/api.js
const BASE_URL = 'https://beansql.attsant.cn';
const APP_SECRET = 'BEANS_DIY_2026_SECURE_TOKEN'; // 与 Worker 服务端校验秘钥对齐

const request = (url, method, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: { 
        'Content-Type': 'application/json',
        'X-App-Secret': APP_SECRET // 注入安全验证头，防爬虫直刷
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data || res.data);
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = {
  // 1. 管理员体系
  adminLogin: (name, password) => request('/api/admin/login', 'POST', { name, password }),
  getAdminList: () => request('/api/admin/list', 'GET'),
  createAdmin: (data) => request('/api/admin/create', 'POST', data),

  // 2. 玩家体系与画像
  playerLogin: (phone, password) => request('/api/player/login', 'POST', { phone, password }),
  playerRegister: (phone, password, name, invited_by) => request('/api/player/register', 'POST', { phone, password, name, invited_by }),
  getPlayerList: () => request('/api/player/list', 'GET'),
  getPlayerDetail: (phone) => request(`/api/player/detail?phone=${encodeURIComponent(phone)}`, 'GET'),
  
  // 2.1 微信一键登录
  wechatLogin: (data) => request('/api/player/wechat-login', 'POST', data),

  // 3. 套餐管理 (云端持久化)
  getPackages: () => request('/api/packages', 'GET'),
  createPackage: (data) => request('/api/packages/create', 'POST', data),
  togglePackageShelf: (id, is_off_shelf) => request('/api/packages/toggle', 'POST', { id, is_off_shelf }),
  deletePackage: (id) => request('/api/packages/delete', 'POST', { id }),

  // 4. 营业排班 (周一至周四 / 周五 / 周末)
  getSchedules: () => request('/api/schedules', 'GET'),
  updateSchedule: (schedule_type, slots) => request('/api/schedules/update', 'POST', { schedule_type, slots }),

  // 5. 豆色与库存 (云端 D1)
  getColors: () => request('/api/colors', 'GET'),
  adjustColorStock: (code, delta) => request('/api/colors/adjust', 'POST', { code, delta }),
  createColor: (data) => request('/api/colors/create', 'POST', data),

  // 6. 优惠券 (云端时效控制)
  getUserCoupons: (phone) => request(`/api/coupons?phone=${encodeURIComponent(phone)}`, 'GET'),
  sendCoupon: (data) => request('/api/coupons/send', 'POST', data),

  // 7. 预约与订单 (云端 D1)
  getBookings: (status, phone) => {
    const params = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (phone) params.push(`phone=${encodeURIComponent(phone)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return request(`/api/bookings${query}`, 'GET');
  },
  createBooking: (data) => request('/api/bookings', 'POST', data),
  verifyCode: (code) => request('/api/bookings/verify', 'POST', { code }),
  refundBooking: (id, refundAmount, userPhone) => request('/api/bookings/refund', 'POST', { 
    id, 
    refund_amount: refundAmount, 
    user_phone: userPhone 
  }),

  // 8. 密码重置工单链路 (玩家申请与商家核实)
  requestPasswordReset: (phone) => request('/api/player/request-reset', 'POST', { phone }),
  getAdminResetList: () => request('/api/admin/reset-list', 'GET'),
  confirmPasswordReset: (phone, id) => request('/api/admin/confirm-reset', 'POST', { phone, id }),
  
  // 玩家自主修改资料
  updatePlayerProfile: (data) => request('/api/player/update-profile', 'POST', data),
  
  // 停止计时结算接口
  stopOrderTimer: (id) => request('/api/bookings/stop-timer', 'POST', { id })
};