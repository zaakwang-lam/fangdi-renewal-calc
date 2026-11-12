const BANKS = [
  {
    id: "conservative",
    name: "保守通用口径",
    ltv: { 住宅: 0.55, 商铺: 0.4, 写字楼: 0.45, 厂房: 0.35 },
    maxPropertyAgeAtEnd: 40,
    maxBorrowerAgeAtEnd: 65,
    ageHaircutFrom: 20,
    dropWarn: 0.12,
    note: "不绑具体银行。先用这版跟客户对齐缺口。",
  },
  {
    id: "gzcb",
    name: "广州银行·经验模板",
    ltv: { 住宅: 0.65, 商铺: 0.45, 写字楼: 0.5, 厂房: 0.4 },
    maxPropertyAgeAtEnd: 45,
    maxBorrowerAgeAtEnd: 65,
    ageHaircutFrom: 15,
    dropWarn: 0.15,
    note: "本地城商行讨论里通常比大行松一档。不是该行批复。",
  },
  {
    id: "grcb",
    name: "广州农商·经验模板",
    ltv: { 住宅: 0.6, 商铺: 0.45, 写字楼: 0.45, 厂房: 0.4 },
    maxPropertyAgeAtEnd: 40,
    maxBorrowerAgeAtEnd: 65,
    ageHaircutFrom: 15,
    dropWarn: 0.15,
    note: "网点多、个案差大。模板取中位。",
  },
  {
    id: "ccb",
    name: "建设银行广东·经验模板",
    ltv: { 住宅: 0.6, 商铺: 0.4, 写字楼: 0.45, 厂房: 0.35 },
    maxPropertyAgeAtEnd: 35,
    maxBorrowerAgeAtEnd: 60,
    ageHaircutFrom: 15,
    dropWarn: 0.1,
    note: "大行对到期房龄和流水更紧。",
  },
  {
    id: "icbc",
    name: "工商银行广东·经验模板",
    ltv: { 住宅: 0.55, 商铺: 0.4, 写字楼: 0.45, 厂房: 0.35 },
    maxPropertyAgeAtEnd: 35,
    maxBorrowerAgeAtEnd: 60,
    ageHaircutFrom: 15,
    dropWarn: 0.1,
    note: "与建行接近，续作经常卡在重估。",
  },
  {
    id: "cmb",
    name: "招商银行·经验模板",
    ltv: { 住宅: 0.6, 商铺: 0.4, 写字楼: 0.5, 厂房: 0.35 },
    maxPropertyAgeAtEnd: 40,
    maxBorrowerAgeAtEnd: 65,
    ageHaircutFrom: 20,
    dropWarn: 0.12,
    note: "更看流水。诉讼或逾期按受阻。",
  },
];

const TYPES = ["住宅", "商铺", "写字楼", "厂房"];
const DISTRICTS = ["天河", "越秀", "海珠", "荔湾", "番禺", "白云", "黄埔", "花都", "南沙", "从化", "增城"];
const CORE = { 天河: 1, 越秀: 1, 海珠: 1, 荔湾: 1 };
const OUTER = { 花都: 1, 南沙: 1, 从化: 1, 增城: 1 };

function districtHaircut(district, type) {
  if (CORE[district]) return 0;
  if (OUTER[district]) return type === "住宅" ? 0.05 : 0.08;
  return type === "住宅" ? 0.03 : 0.05;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function calculate(input, bank) {
  if (!(input.currentValue > 0) || !(input.remainingPrincipal > 0)) {
    return { ok: false, message: "先填当前估值和剩余本金，单位万元。", status: "待填写", risks: [], talk: "" };
  }
  const risks = [];
  let base = input.currentValue;
  if (input.originalValue > 0 && input.currentValue > input.originalValue * 1.05) {
    base = input.originalValue;
    risks.push("自报估值高于原评估 5% 以上，测算改按原评估。");
  }
  if (input.originalValue > 0) {
    const drop = (input.originalValue - input.currentValue) / input.originalValue;
    if (drop > bank.dropWarn) risks.push("估值较原评估下降超过模板警戒，按新评估准备。");
  }
  const steps = Math.floor(Math.max(0, input.age - bank.ageHaircutFrom) / 5);
  let ltv = bank.ltv[input.type] - steps * 0.05 - districtHaircut(input.district, input.type);
  ltv = Math.min(0.7, Math.max(0.25, ltv));
  const propertyEnd = input.age + input.remainingYears;
  const borrowerEnd = input.borrowerAge + input.remainingYears;
  if (propertyEnd > bank.maxPropertyAgeAtEnd) risks.push("到期房龄超过模板上限。");
  if (borrowerEnd > bank.maxBorrowerAgeAtEnd) risks.push("到期借款人年龄超过模板上限。");
  const blocked = !!(input.lawsuit || input.overdue);
  if (input.lawsuit) risks.push("有未结诉讼，不按能续来报。");
  if (input.overdue) risks.push("当前逾期，先处理逾期。");
  const maxLoan = round1(base * ltv);
  const gap = round1(input.remainingPrincipal - maxLoan);
  const cover = maxLoan / input.remainingPrincipal;
  const ageOk = propertyEnd <= bank.maxPropertyAgeAtEnd && borrowerEnd <= bank.maxBorrowerAgeAtEnd;
  const full = !blocked && ageOk && gap <= 0;
  const status = blocked ? "受阻" : full ? "可谈全额" : "有缺口";
  const suggested = blocked ? 0 : full ? round1(input.remainingPrincipal) : Math.max(0, maxLoan);
  const ltvText = Math.round(ltv * 100) + "%";
  const talk = blocked
    ? "按" + bank.name + "，理论上限约 " + maxLoan + " 万，但诉讼或逾期未处理前不要说能续。这不是银行批复。"
    : full
      ? "按当前估值 " + round1(input.currentValue) + " 万、" + bank.name + "，抵押率约 " + ltvText + "，理论上限约 " + maxLoan + " 万，能盖住剩余本金 " + round1(input.remainingPrincipal) + " 万。仍要看征信、流水和新评估。这不是批复。"
      : "按当前估值 " + round1(input.currentValue) + " 万、" + bank.name + "，抵押率约 " + ltvText + "，理论上限约 " + maxLoan + " 万，剩余本金 " + round1(input.remainingPrincipal) + " 万，大约差 " + Math.max(0, gap) + " 万。不要承诺全额续上。这不是批复。";
  return {
    ok: true,
    ltvText: ltvText,
    maxLoan: maxLoan,
    gap: Math.max(0, gap),
    coverText: Math.round(cover * 100) + "%",
    suggested: round1(suggested),
    status: status,
    statusClass: status === "可谈全额" ? "ok" : status === "受阻" ? "bad" : "warn",
    risks: risks,
    talk: talk,
    bankName: bank.name,
    note: bank.note,
  };
}

module.exports = { BANKS, TYPES, DISTRICTS, calculate };
