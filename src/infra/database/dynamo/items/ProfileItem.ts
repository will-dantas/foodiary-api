import { Profile } from "@application/entities/Profile";
import { AccountItem } from "./AccountItem";

export class ProfileItem {
  private readonly type = 'Profile';
  private readonly keys: ProfileItem.keys;

  constructor(private readonly attr: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attr.accountId),
      SK: ProfileItem.getSK(this.attr.accountId),
    };
  }

  static fromEntity(profile: Profile): ProfileItem {
    return new ProfileItem({
      ...profile,
      birthDate: profile.birthDate.toISOString(),
      createdAt: profile.createdAt.toISOString(),
    });
  }

  static toEntity(profileItem: ProfileItem.ItemType) {
    return new Profile({
      accountId: profileItem.accountId,
      name: profileItem.name,
      birthDate: new Date(profileItem.birthDate),
      gender: profileItem.gender,
      height: profileItem.height,
      weight: profileItem.weight,
      actvityLevel: profileItem.actvityLevel,
      createdAt: new Date(profileItem.createdAt),
    });
  }

  static getPK(accountId: string): ProfileItem.keys["PK"] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): ProfileItem.keys["SK"] {
    return `ACCOUNT#${accountId}#PROFILE`;
  }


  toItem(): ProfileItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }
}

export namespace ProfileItem {
  export type keys = {
    PK: AccountItem.keys["PK"];
    SK: `ACCOUNT#${string}#PROFILE`;
  }

  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: string;
    gender: Profile.Gender;
    height: number;
    weight: number;
    actvityLevel: Profile.ActvityLevel;
    createdAt: string;
  };

  export type ItemType = keys & Attributes & {
    type: 'Profile';
  };
}