type Color = "purple" | "pink" | "gold" | "green" | "red" | "blue" | "gray";

export const CAT_COL: Record<string, Color> = {
  hemat: "green",
  bintang4: "purple",
  tabungan: "gold",
  ramadhan: "pink",
  group: "blue",
};

export const DEPT_COL: Record<string, Color> = {
  Management: "pink",
  Marketing: "purple",
  "Customer Service": "blue",
  Operations: "green",
  Finance: "gold",
};

export const CTX_COL: Record<string, Color> = {
  general: "purple",
  "halal-tour": "green",
  korporat: "blue",
  umroh: "purple",
};

export const ACT_COL: Record<string, Color> = {
  created: "green",
  updated: "blue",
  deleted: "red",
  login: "gray",
  logout: "gray",
};

export const LEAD_ST: Record<string, Color> = {
  new: "pink",
  read: "blue",
  responded: "purple",
  quoted: "gold",
  closed: "gray",
};

export const SCHED_ST: Record<string, Color> = {
  upcoming: "purple",
  ongoing: "gold",
  completed: "green",
  cancelled: "red",
};

export const ROLE_COL: Record<string, Color> = {
  super_admin: "pink",
  admin: "purple",
  editor: "gold",
  cs_agent: "blue",
};

export const LEAD_ORDER = ["new", "read", "responded", "closed"] as const;
export const CORP_ORDER = ["new", "read", "responded", "quoted", "closed"] as const;
