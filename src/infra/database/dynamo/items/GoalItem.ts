import { Goal } from "@application/entities/Goal";
import { AccountItem } from "./AccountItem";

export class GoalItem {
  static readonly type = 'Goal';
  private readonly keys: GoalItem.keys;

  constructor(private readonly attr: GoalItem.Attributes) {
    this.keys = {
      PK: GoalItem.getPK(this.attr.accountId),
      SK: GoalItem.getSK(this.attr.accountId),
    };
  }

  static fromEntity(goal: Goal) {
    return new GoalItem({
      ...goal,
      createdAt: goal.createdAt.toISOString(),
    });
  }

  static toEntity(goalItem: GoalItem.ItemType) {
    return new Goal({
      accountId: goalItem.accountId,
      calories: goalItem.calories,
      proteins: goalItem.proteins,
      carbohydrates: goalItem.carbohydrates,
      fats: goalItem.fats,
      createdAt: new Date(goalItem.createdAt),
    });
  }

  static getPK(accountId: string): GoalItem.keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): GoalItem.keys["SK"] {
    return `ACCOUNT#${accountId}#GOAL`;
  }


  toItem(): GoalItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: GoalItem.type,
    };
  }
}

export namespace GoalItem {
  export type keys = {
    PK: AccountItem.keys["PK"];
    SK: `ACCOUNT#${string}#GOAL`;
  }

  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt: string;
  };

  export type ItemType = keys & Attributes & {
    type: 'Goal';
  };
}