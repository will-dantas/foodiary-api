import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { confirmForgotPasswordSchema, ConfirmForgotPasswordBody } from "@application/controllers/auth/schemas/confirmForgotPasswordSchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { ConfirmForgotPasswordUseCase } from "@application/useCases/auth/ConfirmForgotPasswordUseCase";
import { BadRequest } from "@application/errors/http/BadRequest";

@Injectable()
@Schema(confirmForgotPasswordSchema)
export class ConfirmForgotPasswordController extends Controller<'public', ConfirmForgotPasswordController.Response> {
  constructor(
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', ConfirmForgotPasswordBody>): Promise<Controller.Response<ConfirmForgotPasswordController.Response>> {
    try {
      const { email, confirmationCode, newPassword } = body;
      await this.confirmForgotPasswordUseCase.execute({ email, confirmationCode, newPassword });
  
      return {
        statusCode: 204
      };
    } catch {
      throw new BadRequest('Failed to confirm forgot password. Please, check the information and try again.');
    }
  }
}

export namespace ConfirmForgotPasswordController {
  export type Response = null;
}
