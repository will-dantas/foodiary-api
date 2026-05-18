export class Goal {
  readonly accountId: string;

  calories: number;

  proteins: number;

  carbohydrates: number;

  fats: number;

  readonly createdAt: Date;

  constructor(attr: Goal.Attributes) {
    this.accountId = attr.accountId;
    this.calories = attr.calories;
    this.carbohydrates = attr.carbohydrates;
    this.proteins = attr.proteins;
    this.fats = attr.fats;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Goal {
  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt?: Date;
  };
}