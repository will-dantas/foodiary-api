import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { forgotPasswordSchema, ForgotPasswordBody } from "@application/controllers/auth/schemas/forgotPasswordSchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { ForgotPasswordUseCase } from "@application/useCases/auth/ForgotPasswordUseCase";
import { BadRequest } from "@application/errors/http/BadRequest";

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<'public', ForgotPasswordController.Response> {
  constructor(
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', ForgotPasswordBody>): Promise<Controller.Response<ForgotPasswordController.Response>> {
    try {
      const { email } = body;
      await this.forgotPasswordUseCase.execute({ email });
    } catch {
      //
    }

    return {
      statusCode: 204
    };
  }
}

export namespace ForgotPasswordController {
  export type Response = null;
}
