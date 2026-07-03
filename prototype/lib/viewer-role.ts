/** 原型演示用：当前浏览者身份与信息可见级别 */

export type ViewerRole = "guest" | "phone" | "kyc" | "agent" | "staff";

export type ViewerRoleMeta = {
  id: ViewerRole;
  label: string;
  description: string;
};

export const viewerRoles: ViewerRoleMeta[] = [
  { id: "guest", label: "未登录", description: "仅公开字段，敏感信息脱敏" },
  { id: "phone", label: "手机验证", description: "可查看挂牌价与基础户型" },
  { id: "kyc", label: "实名认证", description: "可查看楼层朝向与估价参考" },
  { id: "agent", label: "认证经纪人", description: "可查看成交价与维护记录" },
  { id: "staff", label: "平台工作人员", description: "完整字段与审核入口" },
];

export function canViewField(role: ViewerRole, field: FieldVisibilityKey): boolean {
  return fieldVisibilityMatrix[field][role];
}

export type FieldVisibilityKey =
  | "unitNumber"
  | "exactFloor"
  | "ownerContact"
  | "dealHistory"
  | "maintainerNotes"
  | "priceReference"
  | "commissionBreakdown";

const fieldVisibilityMatrix: Record<FieldVisibilityKey, Record<ViewerRole, boolean>> = {
  unitNumber: { guest: false, phone: false, kyc: true, agent: true, staff: true },
  exactFloor: { guest: false, phone: false, kyc: true, agent: true, staff: true },
  ownerContact: { guest: false, phone: false, kyc: false, agent: true, staff: true },
  dealHistory: { guest: false, phone: false, kyc: false, agent: true, staff: true },
  maintainerNotes: { guest: false, phone: false, kyc: false, agent: true, staff: true },
  priceReference: { guest: false, phone: true, kyc: true, agent: true, staff: true },
  commissionBreakdown: { guest: false, phone: false, kyc: false, agent: true, staff: true },
};

export function maskValue(role: ViewerRole, field: FieldVisibilityKey, value: string): string {
  if (canViewField(role, field)) return value;
  if (field === "ownerContact") return "登录并认证后可见";
  if (field === "dealHistory") return "经纪人认证后可见";
  if (field === "unitNumber" || field === "exactFloor") return "实名后可见";
  return "—";
}
