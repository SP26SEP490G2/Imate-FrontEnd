export interface FormAddPosition {
  name: string;
  skillIds: number[];
}

export interface FormUpdatePosition {
  name: string;
  isActive: boolean | null;
  skillIds: number[];
}
