export class Profile {
  readonly accourId: string;

  name: string;

  birhDate: Date;

  gender: Profile.Gender;

  height: number;

  weight: number;

  actvityLevel: Profile.ActvityLevel;

  readonly createdAt: Date;

  constructor(attr: Profile.Attributes) {
    this.accourId = attr.accourId;
    this.name = attr.name;
    this.birhDate = attr.birhDate;
    this.gender = attr.gender;
    this.height = attr.height;
    this.weight = attr.weight;
    this.actvityLevel = attr.actvityLevel;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Profile {
  export type Attributes = {
    accourId: string;
    name: string;
    birhDate: Date;
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