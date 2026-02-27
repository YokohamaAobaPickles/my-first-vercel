export const STATUS = {
  DRAFT: "下書き",
  PUBLISHED: "公開中",
  INVALID: "無効",
} as const;

export type StatusType = (typeof STATUS)[keyof typeof STATUS];

