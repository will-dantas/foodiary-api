import { IFileEventHandler } from "@application/contracts/IFileEventsHandler";
import { MealUploadedUseCase } from "@application/useCases/meals/MealUploadedUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class MealFileUploadedEventHandler implements IFileEventHandler {
  constructor(
    private readonly mealUploadedUsecase: MealUploadedUseCase
  ) { }

  async handle({ fileKey }: IFileEventHandler.Input): Promise<void> {
    await this.mealUploadedUsecase.execute({ fileKey });
  }
}