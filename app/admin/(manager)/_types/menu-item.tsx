export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  submenu?: Array<{ label: string; path: string }>;
}
