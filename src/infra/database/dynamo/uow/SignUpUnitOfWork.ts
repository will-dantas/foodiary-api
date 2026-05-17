import { TransactWriteCommand, TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { UnitOfWork } from "./UnitOfWork";
import { Account } from "@application/entities/Account";
import { Profile } from "@application/entities/Profile";
import { Goal } from "@application/entities/Goal";
import { Injectable } from "@kernel/decorators/Injectable";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { GoalRepository } from "../repositories/GoalRepository";

@Injectable()
export class SignUpUnitOfWork extends UnitOfWork {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly goalRepository: GoalRepository,
  ) {
    super();
  }

  async run({ account, profile, goal }: SignUpUnitOfWork.RunParams) {
    this.addPut(this.accountRepository.getPutCommandInput(account));
    this.addPut(this.profileRepository.getPutCommandInput(profile));
    this.addPut(this.goalRepository.getPutCommandInput(goal));

    await this.commit();
  }
}

export namespace SignUpUnitOfWork {
  export type RunParams = {
    account: Account,
    profile: Profile,
    goal: Goal
  }
}