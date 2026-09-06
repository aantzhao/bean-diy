const api = require('../../utils/api.js');

Page({
  data: {
    showLoginModal: false,
    loginType: 'player', // 'player' | 'merchant'
    loginAccount: '',
    loginPassword: '',
    errorMessage: ''
  },

  openPlayerLoginModal() {
    this.setData({
      showLoginModal: true,
      loginType: 'player',
      errorMessage: ''
    });
  },

  openMerchantLoginModal() {
    this.setData({
      showLoginModal: true,
      loginType: 'merchant',
      loginAccount: '',
      loginPassword: '',
      errorMessage: ''
    });
  },

  closeLoginModal() {
    this.setData({ showLoginModal: false, errorMessage: '' });
  },

  stopBubble() {},

  onAccountInput(e) {
    this.setData({ loginAccount: e.detail.value.trim(), errorMessage: '' });
  },

  onPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value.trim(), errorMessage: '' });
  },

  handleWechatQuickLogin() {
    wx.showLoading({ title: '微信授权同步中...' });

    wx.login({
      success: (res) => {
        if (res.code) {
          api.wechatLogin({ code: res.code })
            .then(resData => {
              wx.hideLoading();
              // 从云端返回的数据中获取真实玩家档案与微信昵称
              const player = resData.player || resData;
              wx.setStorageSync('player_profile', player);
              
              // 同步缓存微信昵称供个人中心实时展示
              if (player.name) {
                wx.setStorageSync('wechat_nickName', player.name);
              }

              this.setData({ showLoginModal: false });
              wx.showToast({ title: '登录同步成功', icon: 'success' });
              setTimeout(() => {
                wx.navigateTo({ url: '/pages/player/booking/booking' });
              }, 400);
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({ 
                title: (err && err.message) || '云端同步失败，请检查网络', 
                icon: 'none' 
              });
            });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '微信授权失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络异常，登录失败', icon: 'none' });
      }
    });
  },

  // 【备注】：虚拟玩家对象降级备用方案（当云端网络异常或未配置接口时生效）
  _fallbackToMockPlayer() {
    /*
    const mockPlayer = { 
      phone: '17860380815', 
      name: '微信授权玩家(离线模拟)' 
    };
    wx.setStorageSync('player_profile', mockPlayer);
    */

    wx.showToast({ title: '云端同步接口未就绪', icon: 'none' });
    this.setData({ showLoginModal: false });
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/player/booking/booking' });
    }, 400);
  },

  // 商家管理员登录提交
  handleLoginSubmit() {
    const { loginAccount, loginPassword } = this.data;

    if (!loginAccount) {
      const tip = '请输入管理员姓名！';
      this.setData({ errorMessage: tip });
      return wx.showToast({ title: tip, icon: 'none' });
    }

    if (!loginPassword) {
      this.setData({ errorMessage: '请输入登录密码！' });
      return wx.showToast({ title: '请输入登录密码！', icon: 'none' });
    }

    wx.showLoading({ title: '正在连接云端...' });

    api.adminLogin(loginAccount, loginPassword)
      .then(adminData => {
        wx.hideLoading();
        wx.setStorageSync('current_admin', adminData);
        this.setData({ showLoginModal: false });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/merchant/dashboard/dashboard' });
        }, 400);
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({ errorMessage: (err && err.message) || '账号或密码错误！' });
      });
  }
});