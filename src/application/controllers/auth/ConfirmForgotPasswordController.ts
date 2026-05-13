import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { confirmForgotPasswordSchema, ConfirmForgotPasswordBody } from "@application/controllers/auth/schemas/confirmForgotPasswordSchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { ConfirmForgotPasswordUseCase } from "@application/useCases/auth/ConfirmForgotPasswordUseCase";

@Injectable()
@Schema(confirmForgotPasswordSchema)
export class ConfirmForgotPasswordController extends Controller<'public', ConfirmForgotPasswordController.Response> {
  constructor(
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', ConfirmForgotPasswordBody>): Promise<Controller.Response<ConfirmForgotPasswordController.Response>> {
    const { email, confirmationCode, newPassword } = body;
    await this.confirmForgotPasswordUseCase.execute({ email, confirmationCode, newPassword });

    return {
      statusCode: 204
    };
  }
}

export namespace ConfirmForgotPasswordController {
  export type Response = null;
}
