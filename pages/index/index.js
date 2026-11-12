// pages/index/index.js
Page({
  data: {
    form: {
      type: '住宅',
      age: 10,
      originalValue: 0,
      currentValue: 0,
      loanAmount: 0
    }
  },
  calculate() {
    // TODO: basic calc logic, navigate to result
    const ratio = 0.7; // example
    wx.navigateTo({
      url: '/pages/result/result?ratio=' + ratio
    });
  }
})
