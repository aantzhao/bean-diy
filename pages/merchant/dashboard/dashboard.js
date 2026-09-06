const api = require('../../../utils/api.js');
const promoRules = require('../../../config/promoRules.js');

const DEFAULT_SUPER_ADMIN = {
  id: 'admin_root',
  name: '七月店长',
  phone: '13800000000',
  password: '8888',
  role: 'super_admin'
};

const ALL_HALF_HOUR_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00",
  "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
  "20:30", "21:00", "21:30", "22:00", "22:30"
];

Page({
  data: {
    currentTab: 0,
    currentAdmin: DEFAULT_SUPER_ADMIN,
    allAdmins: [DEFAULT_SUPER_ADMIN],

    showEditAdminModal: false,
    editAdminForm: { name: '', phone: '', password: '' },
    showCreateAdminModal: false,
    createAdminForm: { name: '', phone: '', password: '8888' },

    // 动态席位与工具配置
    maxSeatsConfig: 8,
    maxToolsConfig: 12,
    showSettingModal: false,
    tempSeats: 8,
    tempTools: 12,

    remainingSeats: 8,
    isSeatsFull: false,
    dormCount: 0,
    remainingTools: 12,

    verifyInputCode: '',
    pendingBookingList: [],
    allBookingList: [],

    totalBeanStock: 0,
    colorInventory: [],
    selectedLetter: 'A',
    seriesLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','R','S','T','U','W','Y','Z'],

    allDayHalfHourSlots: ALL_HALF_HOUR_SLOTS,
    currentScheduleType: 'mon_thu',
    schedulesRawData: {},
    currentScheduleSlotsMap: {},
    hasScheduleChanged: false,

    packageList: [],
    showAddPackageModal: false,
    durationStepOptions: ['0.5 小时', '1.0 小时', '1.5 小时', '2.0 小时', '2.5 小时', '3.0 小时', '4.0 小时', '全天无限'],
    durationStepValues: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 8.0],
    pkgDurationIndex: 1,
    newPkgForm: { name: '', price: '', peopleLimit: '1', durationHours: 1.0 },

    showManualPushModal: false,
    manualUserIdx: 0,
    manualPkgIdx: 0,
    manualDiscountPercent: '85',
    selectedPkgOriginPrice: '29.9',
    calcDiscountedPrice: '25.4',
    calcSavedPrice: '4.5',

    promoPushHistory: [],
    showAddColorModal: false,
    presetColors: [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
    ],
    newColorForm: { code: '', name: '', hex: '#2196F3', stock: '500' },

    totalSalesIncome: '0.0',
    totalVerifiedIncome: '0.0',
    verifiedCount: 0,
    playersList: [],
    pendingResetPhones: []
  },

  onShow() {
    this.loadAdminContext();
    this.loadShopSettings();
    this.initInventory();
    this.initPackages();
    this.initSchedules();
    this.loadPlayersList();
  },

  switchTab(e) {
    const idx = Number(e.currentTarget.dataset.index);
    this.setData({ currentTab: idx });
    if (idx === 3) {
      this.loadPlayersList();
    } else if (idx === 0) {
      this.loadShopSettings();
    }
  },

  // 1. 动态读取席位与工具云端配置
  loadShopSettings() {
    if (api.getShopSettings) {
      api.getShopSettings().then(res => {
        if (res && res.data) {
          const s = Number(res.data.total_seats) || 8;
          const t = Number(res.data.total_tools) || 12;
          this.setData({
            maxSeatsConfig: s,
            maxToolsConfig: t,
            tempSeats: s,
            tempTools: t
          }, () => {
            this.refreshAllData();
          });
        } else {
          this.refreshAllData();
        }
      }).catch(() => {
        this.refreshAllData();
      });
    } else {
      this.refreshAllData();
    }
  },

  openSettingModal() {
    this.setData({
      showSettingModal: true,
      tempSeats: this.data.maxSeatsConfig,
      tempTools: this.data.maxToolsConfig
    });
  },

  closeSettingModal() {
    this.setData({ showSettingModal: false });
  },

  onSeatsInput(e) {
    this.setData({ tempSeats: Number(e.detail.value) || 0 });
  },

  onToolsInput(e) {
    this.setData({ tempTools: Number(e.detail.value) || 0 });
  },

  saveShopSettings() {
    const seats = parseInt(this.data.tempSeats) || 8;
    const tools = parseInt(this.data.tempTools) || 12;

    wx.showLoading({ title: '保存中...' });
    if (api.updateShopSettings) {
      api.updateShopSettings({ total_seats: seats, total_tools: tools }).then(() => {
        wx.hideLoading();
        this.setData({
          showSettingModal: false,
          maxSeatsConfig: seats,
          maxToolsConfig: tools
        });
        wx.showToast({ title: '配置已更新', icon: 'success' });
        this.refreshAllData();
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
      });
    } else {
      wx.hideLoading();
      this.setData({
        showSettingModal: false,
        maxSeatsConfig: seats,
        maxToolsConfig: tools
      });
      this.refreshAllData();
    }
  },

  // 2. 商家主控：开始入座计时 (对应 WXML 的 bindtap="handleStartTimer")
  handleStartTimer(e) {
    const code = e.currentTarget.dataset.code;
    wx.showModal({
      title: '开始入座计时',
      content: `确定为预约码【${code}】开始体验计时吗？\n上桌后将记录起始时刻，离店时可停止计时退时长。`,
      confirmText: '开始计时',
      confirmColor: '#2563eb',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '开表中...' });
          api.verifyCode(code).then(resp => {
            wx.hideLoading();
            wx.showToast({ title: (resp && resp.message) || '已开始计时', icon: 'success' });
            this.refreshAllData();
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 3. 商家主控：停止计时并结算退时长
  handleStopTimer(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '停止体验计时',
      content: '确认玩家已结束拼豆并归还工具吗？系统将按半小时向上取整结算，剩余时长自动退还玩家预存账户。',
      confirmText: '停止结算',
      confirmColor: '#ea580c',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '结算中...' });
          if (api.stopOrderTimer) {
            api.stopOrderTimer(id).then(resp => {
              wx.hideLoading();
              wx.showModal({
                title: '结算完成',
                content: (resp && resp.message) || '时长已结算并退还',
                showCancel: false
              });
              this.refreshAllData();
            }).catch(err => {
              wx.hideLoading();
              wx.showToast({ title: (err && err.message) || '结算失败', icon: 'none' });
            });
          }
        }
      }
    });
  },

  loadPlayersList() {
    Promise.all([
      api.getPlayerList(),
      api.getAdminResetList ? api.getAdminResetList() : Promise.resolve([])
    ]).then(([players, resetTasks]) => {
      const pendingPhones = (resetTasks || []).map(t => String(t.phone || '').trim()).filter(Boolean);
      const formattedPlayers = (players || []).map(p => ({
        ...p,
        phoneStr: String(p.phone || '').trim(),
        hasPendingReset: pendingPhones.includes(String(p.phone || '').trim())
      }));
      this.setData({ 
        playersList: formattedPlayers,
        pendingResetPhones: pendingPhones
      });
    }).catch(err => {
      console.error('拉取玩家列表失败', err);
    });
  },

  handleResetPassword(e) {
    const { phone, canReset } = e.currentTarget.dataset;
    const phoneStr = String(phone || '').trim();
    if (!canReset) return wx.showToast({ title: '该用户尚未申请重置密码', icon: 'none' });

    wx.showModal({
      title: '重置密码核实',
      content: `确定为用户【${phoneStr}】重置密码吗？\n重置后初始密码恢复为 8888。`,
      confirmColor: '#dc2626',
      confirmText: '确认重置',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在重置...' });
          api.confirmPasswordReset(phoneStr).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '已成功重置为 8888', icon: 'success' });
            this.loadPlayersList();
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '重置失败', icon: 'none' });
          });
        }
      }
    });
  },

  navigateToUserDetail(e) {
    const phone = e.currentTarget.dataset.phone;
    if (!phone) return wx.showToast({ title: '未获取到手机号', icon: 'none' });
    wx.navigateTo({
      url: `/pages/merchant/user-detail/user-detail?phone=${encodeURIComponent(phone)}`
    });
  },

  loadAdminContext() {
    const cur = wx.getStorageSync('current_admin');
    if (cur) this.setData({ currentAdmin: cur });
    this.loadAdminsList();
  },

  loadAdminsList() {
    api.getAdminList().then(list => {
      this.setData({ allAdmins: list || [DEFAULT_SUPER_ADMIN] });
    }).catch(err => {
      console.error('获取管理员列表失败', err);
    });
  },

  initSchedules() {
    api.getSchedules().then(res => {
      const map = {};
      (res || []).forEach(row => {
        try {
          map[row.schedule_type] = typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots;
        } catch (e) {
          map[row.schedule_type] = [];
        }
      });
      this.setData({ schedulesRawData: map }, () => {
        this.updateCurrentScheduleView();
      });
    }).catch(err => {
      console.error('拉取排班失败', err);
    });
  },

  switchScheduleType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentScheduleType: type }, () => {
      this.updateCurrentScheduleView();
    });
  },

  updateCurrentScheduleView() {
    const currentList = this.data.schedulesRawData[this.data.currentScheduleType] || [];
    const slotMap = {};
    currentList.forEach(slot => { slotMap[slot] = true; });
    this.setData({ currentScheduleSlotsMap: slotMap });
  },

  toggleSlotState(e) {
    const slot = e.currentTarget.dataset.slot;
    const type = this.data.currentScheduleType;
    let list = [...(this.data.schedulesRawData[type] || [])];

    if (list.includes(slot)) {
      list = list.filter(item => item !== slot);
    } else {
      list.push(slot);
      list.sort();
    }

    const newRaw = { ...this.data.schedulesRawData, [type]: list };
    this.setData({ 
      schedulesRawData: newRaw,
      hasScheduleChanged: true
    }, () => {
      this.updateCurrentScheduleView();
    });
  },

  saveScheduleToCloud() {
    const type = this.data.currentScheduleType;
    const slots = this.data.schedulesRawData[type] || [];

    wx.showLoading({ title: '保存排班中...' });
    api.updateSchedule(type, slots).then(() => {
      wx.hideLoading();
      this.setData({ hasScheduleChanged: false });
      wx.showToast({ title: '排班已保存生效', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
    });
  },

  initInventory() {
    api.getColors().then(list => {
      const colors = list || [];
      const total = colors.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
      this.setData({ colorInventory: colors, totalBeanStock: total });
    }).catch(() => {
      const saved = wx.getStorageSync('color_inventory') || [];
      const total = saved.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
      this.setData({ colorInventory: saved, totalBeanStock: total });
    });
  },

  selectSeriesLetter(e) {
    this.setData({ selectedLetter: e.currentTarget.dataset.letter });
  },

  adjustColorStock(e) {
    const { code, delta } = e.currentTarget.dataset;
    wx.showLoading({ title: '更新中...' });
    api.adjustColorStock(code, delta).then(() => {
      wx.hideLoading();
      this.initInventory();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '更新失败', icon: 'none' });
    });
  },

  confirmAddColor() {
    const { code, name, hex, stock } = this.data.newColorForm;
    if (!code || !name) return wx.showToast({ title: '请填写色号和名称', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    api.createColor({ code, name, hex, stock }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ showAddColorModal: false });
      this.initInventory();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '添加失败', icon: 'none' });
    });
  },

  initPackages() {
    api.getPackages().then(list => {
      const pkgs = (list || []).map(p => ({
        ...p,
        isOffShelf: Boolean(p.is_off_shelf)
      }));
      this.setData({ packageList: pkgs });
    }).catch(() => {
      const saved = wx.getStorageSync('custom_packages') || [];
      this.setData({ packageList: saved });
    });
    const pushLogs = wx.getStorageSync('promo_push_logs') || [];
    this.setData({ promoPushHistory: pushLogs });
  },

  openAddPackageModal() {
    this.setData({
      showAddPackageModal: true,
      pkgDurationIndex: 1,
      newPkgForm: { name: '', price: '', peopleLimit: '1', durationHours: 1.0 }
    });
  },
  closeAddPackageModal() { this.setData({ showAddPackageModal: false }); },
  onPkgNameInput(e) { this.setData({ 'newPkgForm.name': e.detail.value.trim() }); },
  onPkgPriceInput(e) { this.setData({ 'newPkgForm.price': e.detail.value.trim() }); },
  onPkgPeopleInput(e) { this.setData({ 'newPkgForm.peopleLimit': e.detail.value.trim() }); },
  onPkgDurationChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      pkgDurationIndex: idx,
      'newPkgForm.durationHours': this.data.durationStepValues[idx]
    });
  },

  confirmAddPackage() {
    const { name, price, peopleLimit, durationHours } = this.data.newPkgForm;
    if (!name || !price) return wx.showToast({ title: '请填写套餐名和价格', icon: 'none' });

    wx.showLoading({ title: '上架中...' });
    api.createPackage({ 
      name, 
      price: parseFloat(price), 
      people_limit: parseInt(peopleLimit) || 1,
      duration_hours: parseFloat(durationHours) || 1.0
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '已同步至云端', icon: 'success' });
      this.setData({ showAddPackageModal: false });
      this.initPackages();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '上架失败', icon: 'none' });
    });
  },

  togglePackageShelf(e) {
    const id = e.currentTarget.dataset.id;
    const currentStatus = Boolean(e.currentTarget.dataset.status);
    const nextStatus = !currentStatus;

    wx.showLoading({ title: '更新中...' });
    api.togglePackageShelf(id, nextStatus).then(() => {
      wx.hideLoading();
      this.initPackages();
      wx.showToast({ title: '状态已变更', icon: 'none' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '更新失败', icon: 'none' });
    });
  },

  deletePackageItem(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除套餐确认',
      content: `确定要彻底删除【${name}】吗？删除后用户端将不再显示。`,
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          api.deletePackage(id).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '已成功删除', icon: 'success' });
            this.initPackages();
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  refreshAllData() {
    api.getBookings().then(list => {
      const all = list || [];
      const pending = all.filter(i => i.status === '待核销' || i.status === '部分退款' || i.status === '体验中');

      const now = new Date();
      const nowTs = now.getTime();
      const curDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const slotMin = curMin < 30 ? "00" : "30";
      const curSlotStr = `${String(curHour).padStart(2, '0')}:${slotMin}`;

      let occupiedSeats = 0;
      let dormCount = 0;

      // 实时格式化计算已开表进行中时间
      pending.forEach(item => {
        if (item.status === '体验中' && item.started_at) {
          const sDate = new Date(Number(item.started_at));
          const sh = String(sDate.getHours()).padStart(2, '0');
          const sm = String(sDate.getMinutes()).padStart(2, '0');
          const diffMin = Math.max(1, Math.floor((nowTs - Number(item.started_at)) / 60000));
          item.startedTimeText = `${sh}:${sm} 开表 (已体验 ${diffMin} 分钟)`;
        }
      });

      all.forEach(item => {
        const count = Number(item.people_count || item.peopleCount) || 1;
        const bTime = item.booking_time || '';
        const pkgName = item.package_name || item.package || '';

        if (item.location === '自己宿舍' && (item.status === '待核销' || item.status === '体验中')) {
          dormCount += count;
          return;
        }

        if (item.location !== '店里') return;

        // 体验中必然占用店内席位
        if (item.status === '体验中') {
          occupiedSeats += count;
          return;
        }

        const isUnlimited = (pkgName.toLowerCase().includes('all') || pkgName.includes('无限') || pkgName.includes('全天') || bTime.includes('全天无限量通票'));
        if (isUnlimited) {
          if (item.status === '已核销') {
            const match = bTime.match(/25h有效至\s+([\d\-:\s]+)/);
            if (match && match[1]) {
              const expTime = new Date(match[1].replace(/-/g, '/')).getTime();
              if (Date.now() <= expTime) {
                occupiedSeats += count;
              }
            }
          }
          return;
        }

        if ((item.status === '待核销' || item.status === '部分退款') && bTime.startsWith(curDateStr) && bTime.includes(curSlotStr)) {
          occupiedSeats += count;
        }
      });

      let salesTotal = 0;
      let verifiedTotal = 0;
      let verifiedNum = 0;

      all.forEach(item => {
        const amt = Number(item.amount) || 0;
        const ref = Number(item.refunded_amount || item.refundedAmount) || 0;
        const actualAmt = Math.max(0, amt - ref);

        salesTotal += actualAmt;
        if (item.status === '已核销') {
          verifiedTotal += actualAmt;
          verifiedNum++;
        }
      });

      const maxSeats = this.data.maxSeatsConfig || 8;
      const maxTools = this.data.maxToolsConfig || 12;

      const remainSeats = Math.max(0, maxSeats - occupiedSeats);
      const remainTools = Math.max(0, maxTools - occupiedSeats - dormCount);

      this.setData({
        allBookingList: all,
        pendingBookingList: pending,
        totalSalesIncome: salesTotal.toFixed(1),
        totalVerifiedIncome: verifiedTotal.toFixed(1),
        verifiedCount: verifiedNum,
        remainingSeats: remainSeats,
        isSeatsFull: remainSeats <= 0,
        dormCount: dormCount,
        remainingTools: remainTools
      });
    }).catch(err => {
      console.error('拉取订单失败', err);
    });
  },

  onCodeInput(e) { this.setData({ verifyInputCode: e.detail.value }); },

  verifyCode() {
    const code = this.data.verifyInputCode.trim();
    if (!code) return wx.showToast({ title: '请输入预约码', icon: 'none' });
    this.handleStartTimer({ currentTarget: { dataset: { code } } });
  },

  openCustomRefundModal(e) {
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
      content: String(maxRefund),
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
          this.processRefund(item.id, val);
        }
      }
    });
  },

  processRefund(id, refundVal) {
    wx.showLoading({ title: '退款处理中...' });
    api.refundBooking(id, refundVal).then(res => {
      wx.hideLoading();
      wx.showToast({ title: (res && res.message) || `已退￥${refundVal}`, icon: 'success' });
      this.refreshAllData();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '退款失败', icon: 'none' });
    });
  },

  triggerAutoPromoPush() {
    const users = this.data.playersList || [];
    if (users.length === 0) return wx.showToast({ title: '暂无注册用户', icon: 'none' });

    wx.showLoading({ title: '推送派发中...' });
    const newLogs = [...this.data.promoPushHistory];
    const expireDays = promoRules.COUPON_EXPIRATION.PUSH_PROMO_DAYS;

    const pushPromises = users.map(u => {
      return api.sendCoupon({
        user_phone: u.phone,
        title: '新老玩家感恩 85 折特惠券',
        discount_val: 85,
        target_pkg: '全场通用',
        expire_days: expireDays
      }).then(() => {
        newLogs.unshift({
          id: 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          targetUser: `${u.name} (${u.phone})`,
          type: '自动规则(1个月)',
          content: `向用户下发 85折 全场通用券，已入云端库`,
          time: new Date().toLocaleTimeString()
        });
      });
    });

    Promise.all(pushPromises).then(() => {
      wx.hideLoading();
      this.setData({ promoPushHistory: newLogs });
      wx.setStorageSync('promo_push_logs', newLogs);
      wx.showToast({ title: `已成功派发 ${users.length} 人`, icon: 'success' });
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '部分派发未完成', icon: 'none' });
    });
  },

  openManualPushModal() {
    if (!this.data.playersList || this.data.playersList.length === 0) {
      return wx.showToast({ title: '暂无用户可推送', icon: 'none' });
    }
    const currentPkg = this.data.packageList[0] || { price: 29.9 };
    this.setData({
      showManualPushModal: true,
      manualUserIdx: 0,
      manualPkgIdx: 0,
      manualDiscountPercent: '85',
      selectedPkgOriginPrice: Number(currentPkg.price).toFixed(1)
    });
    this.recalcDiscount();
  },

  closeManualPushModal() { this.setData({ showManualPushModal: false }); },
  onManualUserChange(e) { this.setData({ manualUserIdx: Number(e.detail.value) }); },
  onManualPkgChange(e) {
    const idx = Number(e.detail.value);
    const pkg = this.data.packageList[idx];
    this.setData({
      manualPkgIdx: idx,
      selectedPkgOriginPrice: Number(pkg.price).toFixed(1)
    });
    this.recalcDiscount();
  },

  onManualPercentInput(e) {
    let val = e.detail.value.replace(/[^0-9]/g, '');
    if (Number(val) > 99) val = '99';
    this.setData({ manualDiscountPercent: val });
    this.recalcDiscount();
  },

  recalcDiscount() {
    const origin = parseFloat(this.data.selectedPkgOriginPrice) || 0;
    const percent = parseFloat(this.data.manualDiscountPercent) || 100;
    const discounted = (origin * (percent / 100)).toFixed(1);
    const saved = (origin - discounted).toFixed(1);
    this.setData({
      calcDiscountedPrice: discounted,
      calcSavedPrice: Math.max(0, saved).toFixed(1)
    });
  },

  confirmManualPush() {
    const user = this.data.playersList[this.data.manualUserIdx];
    const pkg = this.data.packageList[this.data.manualPkgIdx];
    const percent = parseFloat(this.data.manualDiscountPercent) || 85;

    if (!user || !pkg) return wx.showToast({ title: '请选择用户与套餐', icon: 'none' });

    wx.showLoading({ title: '入库派发中...' });
    const expireDays = promoRules.COUPON_EXPIRATION.PUSH_PROMO_DAYS;

    api.sendCoupon({
      user_phone: user.phone,
      title: `专属 ${percent}折 特惠券`,
      discount_val: percent,
      target_pkg: pkg.name,
      expire_days: expireDays
    }).then(() => {
      wx.hideLoading();
      const logItem = {
        id: 'manual_' + Date.now(),
        targetUser: `${user.name} (${user.phone})`,
        type: '指定时效券(1个月)',
        content: `派发【${pkg.name}】${percent}% 折扣券 (折后: ￥${this.data.calcDiscountedPrice})`,
        time: new Date().toLocaleTimeString()
      };
      const newLogs = [logItem, ...this.data.promoPushHistory];
      this.setData({ promoPushHistory: newLogs, showManualPushModal: false });
      wx.setStorageSync('promo_push_logs', newLogs);
      wx.showToast({ title: '已入库派发', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '派发失败', icon: 'none' });
    });
  },

  openAddColorDialog() { this.setData({ showAddColorModal: true, newColorForm: { code: '', name: '', hex: '#2196F3', stock: '500' } }); },
  closeAddColorDialog() { this.setData({ showAddColorModal: false }); },
  stopBubble() {},
  onNewColorCodeInput(e) { this.setData({ 'newColorForm.code': e.detail.value.toUpperCase() }); },
  onNewColorNameInput(e) { this.setData({ 'newColorForm.name': e.detail.value }); },
  onNewColorStockInput(e) { this.setData({ 'newColorForm.stock': e.detail.value }); },
  selectPresetColor(e) { this.setData({ 'newColorForm.hex': e.currentTarget.dataset.hex }); },
  openEditCurrentAdmin() { this.setData({ showEditAdminModal: true, editAdminForm: { name: this.data.currentAdmin.name || '', phone: this.data.currentAdmin.phone || '', password: '' } }); },
  closeEditAdminModal() { this.setData({ showEditAdminModal: false }); },
  onEditNameInput(e) { this.setData({ 'editAdminForm.name': e.detail.value.trim() }); },
  onEditPhoneInput(e) { this.setData({ 'editAdminForm.phone': e.detail.value.trim() }); },
  onEditPasswordInput(e) { this.setData({ 'editAdminForm.password': e.detail.value.trim() }); },
  saveCurrentAdmin() {
    const { name, phone, password } = this.data.editAdminForm;
    if (!name || !phone) return wx.showToast({ title: '姓名和手机号不能为空', icon: 'none' });
    let cur = { ...this.data.currentAdmin, name, phone };
    if (password) cur.password = password;
    wx.setStorageSync('current_admin', cur);
    this.setData({ currentAdmin: cur, showEditAdminModal: false });
    wx.showToast({ title: '修改成功', icon: 'success' });
  },
  openCreateAdminModal() { this.setData({ showCreateAdminModal: true, createAdminForm: { name: '', phone: '', password: '8888' } }); },
  closeCreateAdminModal() { this.setData({ showCreateAdminModal: false }); },
  onCreateNameInput(e) { this.setData({ 'createAdminForm.name': e.detail.value.trim() }); },
  onCreatePhoneInput(e) { this.setData({ 'createAdminForm.phone': e.detail.value.trim() }); },
  onCreatePasswordInput(e) { this.setData({ 'createAdminForm.password': e.detail.value.trim() }); },
  confirmCreateAdmin() {
    const { name, phone, password } = this.data.createAdminForm;
    if (!name || !phone || !password) return wx.showToast({ title: '请完整填写', icon: 'none' });
    wx.showLoading({ title: '创建中...' });
    api.createAdmin({ name, phone, password, role: 'staff_admin' }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '账号已同步至云端', icon: 'success' });
      this.setData({ showCreateAdminModal: false, createAdminForm: { name: '', phone: '', password: '8888' } });
      this.loadAdminsList();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '创建失败', icon: 'none' });
    });
  }
});