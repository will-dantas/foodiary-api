import { Meal } from "@application/entities/Meal";
import { GetCommand, PutCommand, PutCommandInput, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";
import { MealItem } from "../items/MealItem";
import { dynamoClient } from "@infra/clients/dynamoClient";

@Injectable()
export class MealRepository {
  constructor(private readonly config: AppConfig) { }

  async findById({ mealId, accountId }: MealRepository.FindByIdParams): Promise<Meal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: MealItem.getPK({ accountId, mealId }),
        SK: MealItem.getSK({ accountId, mealId }),
      }
    });

    const { Item: mealItem } = await dynamoClient.send(command);

    if (!mealItem) {
      return null;
    }

    return MealItem.toEntity(mealItem as MealItem.ItemType);
  }


  async save(profile: Meal): Promise<void> {
    const profileItem = MealItem.fromEntity(profile).toItem();

    const command = new UpdateCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: profileItem.PK,
        SK: profileItem.SK,
      },
      UpdateExpression: 'SET #status = :status, #attempts = :attempts, #name = :name, #icon = :icon, #foods = :foods',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#attempts': 'attempts',
        '#name': 'name',
        '#icon': 'icon',
        '#foods': 'foods',
      },
      ExpressionAttributeValues: {
        ':status': profileItem.status,
        ':attempts': profileItem.attempts,
        ':name': profileItem.name,
        ':icon': profileItem.icon,
        ':foods': profileItem.foods,
      },
      ReturnValues: 'NONE'
    });

    await dynamoClient.send(command);
  }

  getPutCommandInput(meal: Meal): PutCommandInput {
    const mealItem = MealItem.fromEntity(meal);

    return {
      TableName: this.config.db.dynamodb.mainTable,
      Item: mealItem.toItem(),
    }
  }

  async create(meal: Meal): Promise<void> {
    await dynamoClient.send(
      new PutCommand(this.getPutCommandInput(meal))
    );
  }
}

export namespace MealRepository {
  export type FindByIdParams = {
    mealId: string;
    accountId: string;
  }
}