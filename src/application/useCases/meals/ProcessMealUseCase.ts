import { Meal } from '@application/entities/Meal';
import { ResourceNotFound } from '@application/errors/application/ResourceNotFound';
import { MealRepository } from '@infra/database/dynamo/repositories/MealRepository';
import { MealsFileStorageGateway } from '@infra/gateways/MealsFileStorageGateway';
import { Injectable } from '@kernel/decorators/Injectable';

const MAX_ATTEMPTS = 3;

@Injectable()
export class ProcessMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealsFileStorageGateway: MealsFileStorageGateway
  ) { }

  async execute({ accountId, mealId }: ProcessMealUseCase.Input): Promise<ProcessMealUseCase.Output> {
    const meal = await this.mealRepository.findById({ accountId, mealId });

    if (!meal) {
      throw new ResourceNotFound(`Meal "${mealId}" not found`);
    }

    if (meal.status === Meal.Status.UPLOADING) {
      throw new Error(`Meal "${mealId}" is still uploading`);
    }

    if (meal.status === Meal.Status.PROCESSING) {
      throw new Error(`Meal "${mealId}" is already being processed`);
    }

    if (meal.status === Meal.Status.SUCCESS) {
      return;
    }

    try {
      meal.status = Meal.Status.PROCESSING;
      meal.attempts += 1;

      await this.mealRepository.save(meal);

      meal.status = Meal.Status.SUCCESS;
      meal.name = 'Café da manhã';
      meal.icon = '🥐';
      meal.foods = [{
        calories: 200,
        carbohydrates: 30,
        fats: 300,
        name: 'Pão com manteiga',
        proteins: 10,
        quantity: '1 unidade',
      }];

      await this.mealRepository.save(meal);
    } catch (error) {
      meal.status = meal.attempts >= MAX_ATTEMPTS
        ? Meal.Status.FAILED
        : Meal.Status.QUEUED;

      await this.mealRepository.save(meal);

      throw error;
    }
  }
}

export namespace ProcessMealUseCase {
  export type Input = {
    accountId: string;
    mealId: string;
  };

  export type Output = void;
}