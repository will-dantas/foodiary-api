export class Profile {
  readonly accountId: string;

  name: string;

  birthDate: Date;

  gender: Profile.Gender;

  height: number;

  weight: number;

  actvityLevel: Profile.ActvityLevel;

  readonly createdAt: Date;

  constructor(attr: Profile.Attributes) {
    this.accountId = attr.accountId;
    this.name = attr.name;
    this.birthDate = attr.birthDate;
    this.gender = attr.gender;
    this.height = attr.height;
    this.weight = attr.weight;
    this.actvityLevel = attr.actvityLevel;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Profile {
  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: Date;
    gender: Profile.Gender;
    height: number;
    weight: number;
    actvityLevel: Profile.ActvityLevel;
    createdAt?: Date;
  };

  export enum Gender {
    MALE = 'MALE',
    FAMALE = 'FAMALE',
  };

  export enum ActvityLevel {
    SEDENTARY = 'SEDENTARY',
    LIGHT = 'LIGHT',
    MODERATE = 'MODERATE',
    HEAVY = 'HEAVY',
    ATHLETE = 'ATHLETE',
  };
}