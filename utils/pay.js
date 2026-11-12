const PLANS = [
  { id: "alert", name: "提醒月卡", priceFen: 2900, productId: "plan_alert_month" },
  { id: "pro", name: "专业月卡", priceFen: 6900, productId: "plan_pro_month" },
  { id: "full", name: "全功能月卡", priceFen: 9900, productId: "plan_full_month" },
];

function canRequestVirtualPayment() {
  return typeof wx !== "undefined" && typeof wx.requestVirtualPayment === "function";
}

function requestPlanPayment(order) {
  return new Promise((resolve, reject) => {
    if (!canRequestVirtualPayment()) {
      reject(new Error("当前基础库或主体不能发起虚拟支付"));
      return;
    }
    wx.requestVirtualPayment({
      mode: order.mode || "short_series_goods",
      signData: order.signData,
      paySig: order.paySig,
      signature: order.signature,
      success: resolve,
      fail: reject,
    });
  });
}

module.exports = { PLANS, canRequestVirtualPayment, requestPlanPayment };
