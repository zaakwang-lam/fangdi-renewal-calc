Page({
  data: {
    plans: [
      { name: "免费", price: "0", desc: "保守口径测算、复制话术" },
      { name: "提醒", price: "29", desc: "保存筛选条件，和银登工具一起用" },
      { name: "专业", price: "69", desc: "五家银行经验模板" },
      { name: "全功能", price: "99", desc: "专业档加上本地测算记录" },
    ],
  },

  onChoose(e) {
    const name = e.currentTarget.dataset.name;
    wx.showModal({
      title: "开发预览",
      content: name + "档还没接微信支付。企业主体开通虚拟支付后再替换 utils 里的下单。现在所有口径都能直接测算。",
      showCancel: false,
      confirmText: "知道了",
      confirmColor: "#1A365D",
    });
  },
});
