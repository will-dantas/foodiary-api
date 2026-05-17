import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { SingUpBody, singUpSchema } from "@application/controllers/auth/schemas/signUpSchema";
import { SignUpUseCase } from "@application/useCases/auth/SignUpUseCase";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
@Schema(singUpSchema)
export class SingUpController extends Controller<'public', SingUpController.Response> {
  constructor(
    private readonly signUpUseCase: SignUpUseCase
  ) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', SingUpBody>): Promise<Controller.Response<SingUpController.Response>> {
    const { account, profile } = body;
    const { accessToken, refreshToken } = await this.signUpUseCase.execute({ account, profile });

    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken
      }
    }
  }
}

export namespace SingUpController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  }
}
