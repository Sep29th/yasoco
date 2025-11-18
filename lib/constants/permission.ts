export const ALL_PERMISSION = [
  "user:read",
  "user:create",
  "user:update",
  "user:delete",

  "role:read",
  "role:create",
  "role:update",
  "role:delete",

  "examination:read",
  "examination:create",
  "examination:update",
  "examination:delete",

  "examination-session:read",
  "examination-session:create",
  "examination-session:update",
  "examination-session:delete",

  "article:read",
  "article:create",
  "article:update",
  "article:delete",
  "article:publish",

  "tag:read",
  "tag:create",
  "tag:update",
  "tag:delete",
];

export const RESOURCES = [
  {
    key: "user",
    label: "Người dùng",
    description: "Các quyền đối với người dùng",
    actions: [
      { value: "user:read", label: "Xem danh sách người dùng" },
      { value: "user:create", label: "Tạo tài khoản người dùng mới" },
      { value: "user:update", label: "Sửa thông tin người dùng trong hệ thống" },
      { value: "user:delete", label: "Xóa tài khoản người dùng trong hệ thống" },
    ],
  },
  {
    key: "role",
    label: "Vai trò",
    description: "Các quyền đối với vai trò",
    actions: [
      { value: "role:read", label: "Xem danh sách vai trò" },
      { value: "role:create", label: "Tạo vai trò mới" },
      { value: "role:update", label: "Sửa thông tin của vai trò" },
      { value: "role:delete", label: "Xóa vai trò" },
    ],
  },
  {
    key: "examination",
    label: "Lịch khám",
    description: "Các quyền đối với lịch khám",
    actions: [
      { value: "examination:read", label: "Xem danh sách lịch khám" },
      { value: "examination:create", label: "Tạo lịch khám mới" },
      { value: "examination:update", label: "Sửa thông tin lịch khám" },
      { value: "examination:delete", label: "Xóa lịch khám" },
    ],
  },
  {
    key: "examination-session",
    label: "Giờ khám",
    description: "Các quyền đối với giờ khám",
    actions: [
      { value: "examination-session:read", label: "Xem các giờ khám có thể đặt lịch" },
      { value: "examination-session:create", label: "Tạo giờ khám có thể đặt lịch" },
      { value: "examination-session:update", label: "Sửa giờ khám có thể đặt lịch" },
      { value: "examination-session:delete", label: "Xóa giờ khám" },
    ],
  },
  {
    key: "article",
    label: "Bài viết",
    description: "Các quyền đối với bài viết",
    actions: [
      { value: "article:read", label: "Xem danh sách các bài viết" },
      { value: "article:create", label: "Tạo bài viết mới" },
      { value: "article:update", label: "Sửa bài viết" },
      { value: "article:publish", label: "Đăng tải" },
      { value: "article:delete", label: "Xóa bài viết" },
    ],
  },
  {
    key: "tag",
    label: "Chủ đề",
    description: "Các quyền đối với chủ đề",
    actions: [
      { value: "tag:read", label: "Xem danh sách chủ đề cho bài viết" },
      { value: "tag:create", label: "Tạo chủ đề mới cho bài viết" },
      { value: "tag:update", label: "Sửa chủ đề" },
      { value: "tag:delete", label: "Xóa chủ đề" },
    ],
  },
];

export const PERMISSION_LABEL_MAP: Record<string, string> = RESOURCES.reduce(
  (acc, resource) => {
    resource.actions.forEach((action) => {
      acc[action.value] = action.label;
    });
    return acc;
  },
  {} as Record<string, string>
);

export const ACCESS_LEVEL_MAP: Record<
  string,
  { viewer: string[]; editor: string[]; manager: string[] }
> = {
  user: {
    viewer: ["user:read"],
    editor: ["user:read", "user:create", "user:update"],
    manager: ["user:read", "user:create", "user:update", "user:delete"],
  },
  role: {
    viewer: ["role:read"],
    editor: ["role:read", "role:create", "role:update"],
    manager: ["role:read", "role:create", "role:update", "role:delete"],
  },
  examination: {
    viewer: ["examination:read"],
    editor: ["examination:read", "examination:create", "examination:update"],
    manager: [
      "examination:read",
      "examination:create",
      "examination:update",
      "examination:delete",
    ],
  },
  "examination-session": {
    viewer: ["examination-session:read"],
    editor: [
      "examination-session:read",
      "examination-session:create",
      "examination-session:update",
    ],
    manager: [
      "examination-session:read",
      "examination-session:create",
      "examination-session:update",
      "examination-session:delete",
    ],
  },
  article: {
    viewer: ["article:read"],
    editor: ["article:read", "article:create", "article:update"],
    manager: [
      "article:read",
      "article:create",
      "article:update",
      "article:delete",
      "article:publish",
    ],
  },
  tag: {
    viewer: ["tag:read"],
    editor: ["tag:read", "tag:create", "tag:update"],
    manager: ["tag:read", "tag:create", "tag:update", "tag:delete"],
  },
};
