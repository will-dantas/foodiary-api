import { Meal } from "@application/entities/Meal";
import { MealRepository } from "@infra/database/dynamo/repositories/MealRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateMealUpUseCase {
  constructor(
    private readonly mealRepository: MealRepository
  ){}

  async execute({ accountId, file }: CreateMealUpUseCase.Input): Promise<CreateMealUpUseCase.Output> {
    const meal = new Meal({
      accountId,
      inputType: file.inputType,
      status: Meal.Status.UPLOADING,
      inputFileKey: 'file-example'
    });

    await this.mealRepository.create(meal);

    return { mealId: meal.id }
  }
}

export namespace CreateMealUpUseCase {
  export type Input = {
    accountId: string;
    file: {
      inputType: Meal.InputType;
      size: number;
    }
  };

  export type Output = {
    mealId: string;
  };
}