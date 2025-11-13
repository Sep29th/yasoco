export interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  submenu?: Array<{ label: string; path: string }>;
}
