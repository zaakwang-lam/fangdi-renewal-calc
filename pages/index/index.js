const { BANKS, TYPES, DISTRICTS, calculate } = require("../../utils/calc");

const DEFAULT_FORM = {
  type: "住宅",
  district: "天河",
  age: "18",
  borrowerAge: "42",
  originalValue: "280",
  currentValue: "230",
  originalLoan: "180",
  remainingPrincipal: "150",
  remainingYears: "8",
  lawsuit: false,
  overdue: false,
};

Page({
  data: {
    banks: BANKS.map((item) => item.name),
    types: TYPES,
    districts: DISTRICTS,
    bankIndex: 0,
    typeIndex: 0,
    districtIndex: 0,
    form: DEFAULT_FORM,
    result: null,
  },

  onLoad() {
    this.runCalc(DEFAULT_FORM, 0, 0, 0);
  },

  onBank(e) {
    const bankIndex = Number(e.detail.value);
    this.setData({ bankIndex });
    this.runCalc(this.data.form, bankIndex, this.data.typeIndex, this.data.districtIndex);
  },

  onType(e) {
    const typeIndex = Number(e.detail.value);
    const form = Object.assign({}, this.data.form, { type: TYPES[typeIndex] });
    this.setData({ typeIndex, form });
    this.runCalc(form, this.data.bankIndex, typeIndex, this.data.districtIndex);
  },

  onDistrict(e) {
    const districtIndex = Number(e.detail.value);
    const form = Object.assign({}, this.data.form, { district: DISTRICTS[districtIndex] });
    this.setData({ districtIndex, form });
    this.runCalc(form, this.data.bankIndex, this.data.typeIndex, districtIndex);
  },

  onNum(e) {
    const key = e.currentTarget.dataset.k;
    const form = Object.assign({}, this.data.form, { [key]: e.detail.value });
    this.setData({ form });
  },

  onSwitch(e) {
    const key = e.currentTarget.dataset.k;
    const form = Object.assign({}, this.data.form, { [key]: e.detail.value });
    this.setData({ form });
  },

  onCalc() {
    this.runCalc(this.data.form, this.data.bankIndex, this.data.typeIndex, this.data.districtIndex);
  },

  runCalc(form, bankIndex, typeIndex, districtIndex) {
    const input = {
      type: TYPES[typeIndex],
      district: DISTRICTS[districtIndex],
      age: Number(form.age) || 0,
      borrowerAge: Number(form.borrowerAge) || 0,
      originalValue: Number(form.originalValue) || 0,
      currentValue: Number(form.currentValue) || 0,
      originalLoan: Number(form.originalLoan) || 0,
      remainingPrincipal: Number(form.remainingPrincipal) || 0,
      remainingYears: Number(form.remainingYears) || 0,
      lawsuit: !!form.lawsuit,
      overdue: !!form.overdue,
    };
    const result = calculate(input, BANKS[bankIndex]);
    this.setData({ result });
    if (!result.ok) {
      wx.showToast({ title: result.message, icon: "none" });
    }
  },

  onCopy() {
    const result = this.data.result;
    if (!result || !result.ok) return;
    wx.setClipboardData({
      data: result.talk,
      success() {
        wx.showToast({ title: "话术已复制", icon: "none" });
      },
    });
  },

  goSubscribe() {
    wx.navigateTo({ url: "/pages/subscribe/subscribe" });
  },
});
