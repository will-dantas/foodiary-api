import { Meal } from "@application/entities/Meal";
import { MealRepository } from "@infra/database/dynamo/repositories/MealRepository";
import { MealsFileStorageGateway } from "@infra/gateways/MealsFileStorageGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateMealUpUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway
  ) { }

  async execute({ accountId, file }: CreateMealUpUseCase.Input): Promise<CreateMealUpUseCase.Output> {
    const inputFileKey = MealsFileStorageGateway.generateInputFileKey({
      accountId,
      inputType: file.inputType
    });

    const meal = new Meal({
      accountId,
      inputType: file.inputType,
      status: Meal.Status.UPLOADING,
      inputFileKey: inputFileKey
    });

    const [, { uploadSignature }] = await Promise.all([
      await this.mealRepository.create(meal),
      await this.mealsFileStorageGateway.createPOST({
        mealId: meal.id,
        accountId,
        file: {
          key: inputFileKey,
          size: file.size,
          inputType: file.inputType
        },
      })
    ]);

    return {
      mealId: meal.id,
      uploadSignature
    }
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
    uploadSignature: string;
  };
}