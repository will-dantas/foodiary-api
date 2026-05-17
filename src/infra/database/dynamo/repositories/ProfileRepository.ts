import { Profile } from "@application/entities/Profile";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";
import { ProfileItem } from "../items/ProfileItem";
import { dynamoClient } from "@infra/clients/dynamoClient";

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) { }

  async create(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: profileItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}