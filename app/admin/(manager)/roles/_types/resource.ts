import { ActionItem } from './action-item';

export type Resource = {
  key: string;
  label: string;
  actions: ActionItem[];
};
