import { Controller } from "@application/contracts/Controller";
import { CreateMealUpUseCase } from "@application/useCases/meals/CreateMealUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { CreateMealBody, createMealSchema } from "./schemas/createMealSchema";
import { Meal } from "@application/entities/Meal";

@Injectable()
@Schema(createMealSchema)
export class CreateMealController extends Controller<'private', CreateMealController.Response> {
  constructor(
    private readonly createMealUpUseCase: CreateMealUpUseCase
  ) {
    super();
  }

  protected override async handle({ accountId, body }: Controller.Request<'private', CreateMealBody>): Promise<Controller.Response<CreateMealController.Response>> {
    const { file } = body;
    const inputType = (
      file.type === 'audio/m4a'
       ? Meal.InputType.AUDIO
       : Meal.InputType.PICTURE
    );
    const { mealId } = await this.createMealUpUseCase.execute({
      accountId,
      file: {
        size: file.size,
        inputType
      }
    });

    return {
      statusCode: 201,
      body: {
        mealId,
      }
    }
  }
}

export namespace CreateMealController {
  export type Response = {
    mealId: string;
  }
}
