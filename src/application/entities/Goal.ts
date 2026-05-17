export class Goal {
  readonly accountId: string;

  colories: number;

  proteins: number;

  carbohydrates: number;

  fat: number;

  readonly createdAt: Date;

  constructor(attr: Goal.Attributes) {
    this.accountId = attr.accountId;
    this.colories = attr.colories;
    this.carbohydrates = attr.carbohydrates;
    this.proteins = attr.proteins;
    this.fat = attr.fats;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Goal {
  export type Attributes = {
    accountId: string;
    colories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt?: Date;
  };
}