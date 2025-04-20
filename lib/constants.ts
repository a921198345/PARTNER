// 知识点重要性常量
export const IMPORTANCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

// 文件类型图标映射
export const FILE_TYPE_ICONS = {
  pdf: "file-type-pdf",
  doc: "file-type-word",
  docx: "file-type-word",
  txt: "file-text",
  md: "file-text",
  rtf: "file-text",
} as const;

// 知识文档状态
export const DOCUMENT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

// 科目类型
export const SUBJECT_TYPES = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"] as const;

// 科目列表
export const SUBJECTS = [
  "语文",
  "数学",
  "英语",
  "物理",
  "化学",
  "生物",
  "历史",
  "地理",
  "政治",
] as const;

// 科目子类别
export const SUBJECT_CATEGORIES = {
  "语文": ["文学常识", "古诗文", "现代文阅读", "文言文阅读", "写作"],
  "数学": ["代数", "几何", "函数", "概率与统计"],
  "英语": ["语法", "阅读理解", "写作", "听力", "口语"],
  "物理": ["力学", "电学", "热学", "光学", "原子物理学"],
  "化学": ["元素化学", "有机化学", "物质结构", "化学反应"],
  "生物": ["细胞", "遗传", "进化", "生态", "人体"],
  "历史": ["中国古代史", "中国近代史", "中国现代史", "世界史"],
  "地理": ["自然地理", "人文地理", "区域地理", "地图"],
  "政治": ["思想政治", "法律", "经济", "哲学"],
} as const; 