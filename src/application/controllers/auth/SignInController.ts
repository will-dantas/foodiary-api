import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { signInSchema, SignInBody } from "@application/controllers/auth/schemas/signInSchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { SignInUseCase } from "@application/useCases/auth/SignInUseCase";

@Injectable()
@Schema(signInSchema)
export class SignInController extends Controller<SignInController.Response> {
  constructor(
    private readonly signInUseCase: SignInUseCase
  ) {
    super();
  }

  protected override async handle({ body }: Controller.Request<SignInBody>): Promise<Controller.Response<SignInController.Response>> {
    const { email, password } = body;
    const { accessToken, refreshToken } = await this.signInUseCase.execute({ email, password });

    return {
      statusCode: 200,
      body: {
        accessToken,
        refreshToken
      }
    }
  }
}

export namespace SignInController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  }
}
