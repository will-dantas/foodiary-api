import { Account } from "@application/entities/Account";
import { Goal } from "@application/entities/Goal";
import { Profile } from "@application/entities/Profile";
import { EmailAlreadyInUse } from "@application/errors/application/EmailAlreadyInUse";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { GoalRepository } from "@infra/database/dynamo/repositories/GoalRepository";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import { SignUpUnitOfWork } from "@infra/database/dynamo/uow/SignUpUnitOfWork";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { ca } from "zod/v4/locales";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly signUpUnitOfWork: SignUpUnitOfWork
  ) { }
  async execute({ account: {
      email, 
      password
  }, profile: profileInfo }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const emailAlreadyInUse = await this.accountRepository.findEmail(email);

    if (emailAlreadyInUse) {
      throw new EmailAlreadyInUse();
    }
    const account = new Account({ email });
    const profile = new Profile({
      ...profileInfo,
      accountId: account.id
    });
    const goal = new Goal({
      accountId: account.id,
      colories: 2000,
      carbohydrates: 500,
      proteins: 180,
      fats: 80
    })

    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id
    });

    account.externalId = externalId;

    await this.signUpUnitOfWork.run({
      account,
      profile,
      goal
    });

    const { accessToken, refreshToken } = await this.authGateway.signIn({ email, password });

    return {
      accessToken,
      refreshToken
    };
  }
}

export namespace SignUpUseCase {
  export type Input = {
    account: {
      email: string;
      password: string;
    }
    profile: {
      name: string;
      birthDate: Date;
      gender: Profile.Gender;
      height: number;
      weight: number;
      actvityLevel: Profile.ActvityLevel;
    }
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
