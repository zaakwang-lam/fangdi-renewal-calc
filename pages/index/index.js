const { BANKS, calculate } = require("../../utils/calc");

Page({
  data: {
    banks: BANKS.map((item) => item.name),
    bankIndex: 0,
    form: {
      type: "住宅",
      district: "天河",
      age: 18,
      borrowerAge: 42,
      originalValue: 280,
      currentValue: 230,
      originalLoan: 180,
      remainingPrincipal: 150,
      remainingYears: 8,
      lawsuit: false,
      overdue: false,
    },
    result: null,
  },
  onBank(e) {
    const bankIndex = Number(e.detail.value);
    const bank = BANKS[bankIndex];
    if (bank.paid) {
      wx.showToast({ title: "该模板需专业档", icon: "none" });
      return;
    }
    this.setData({ bankIndex });
  },
  onNum(e) {
    const key = e.currentTarget.dataset.k;
    const form = { ...this.data.form, [key]: Number(e.detail.value) };
    this.setData({ form });
  },
  onCalc() {
    const bank = BANKS[this.data.bankIndex];
    this.setData({ result: calculate(this.data.form, bank) });
  },
});
