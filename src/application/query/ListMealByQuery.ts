import { Meal } from "@application/entities/Meal";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "@infra/clients/dynamoClient";
import { MealItem } from "@infra/database/dynamo/items/MealItem";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";

@Injectable()
export class ListMealByDayQuery {
  constructor(
    private readonly config: AppConfig
  ) { }

  async execute({ accountId, date }: ListMealByDayQuery.Input): Promise<ListMealByDayQuery.Output> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      IndexName: 'GSI1',
      ProjectionExpression: '#GSI1PK, #id, #name, #foods, #icon, #createdAt',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ExpressionAttributeNames: {
        '#GSI1PK': 'GSI1PK',
        '#id': 'id',
        '#name': 'name',
        '#foods': 'foods',
        '#icon': 'icon',
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':GSI1PK': MealItem.getGSI1PK({
          accountId,
          createdAt: date
        })
      }
    });

    const { Items = [] } = await dynamoClient.send(command);
    const items = Items as ListMealByDayQuery.MealItemType[];

    const meals: ListMealByDayQuery.Output['meals'] = items.map((item) => ({
      id: item.id,
      name: item.name,
      foods: item.foods,
      icon: item.icon,
      createdAt: item.createdAt,
    }));

    return { meals };
  }
}

export namespace ListMealByDayQuery {
  export type Input = {
    accountId: string;
    date: Date;
  };

  export type MealItemType = {
    GSI1PK: string;
    id: string;
    createdAt: string;
    name: string;
    icon: string;
    foods: Meal.Food[];
  };

  export type Output = {
    meals: {
      id: string;
      createdAt: string;
      name: string;
      icon: string;
      foods: Meal.Food[];
    }[];
  };
}