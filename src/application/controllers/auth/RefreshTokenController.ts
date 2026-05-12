import { Controller } from "@application/contracts/Controller";
import { Schema } from "@kernel/decorators/Schema";
import { refreshTokenSchema, RefreshTokenBody } from "@application/controllers/auth/schemas/refreshTokenSchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { RefreshTokenUseCase } from "@application/useCases/auth/RefreshTokenUseCase";

@Injectable()
@Schema(refreshTokenSchema)
export class RefreshTokenController extends Controller<'public', RefreshTokenController.Response> {
  constructor(
    private readonly RefreshTokenUseCase: RefreshTokenUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', RefreshTokenBody>): Promise<Controller.Response<RefreshTokenController.Response>> {
    const { refreshToken } = body;
    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    } = await this.RefreshTokenUseCase.execute({ refreshToken });

    return {
      statusCode: 200,
      body: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    }
  }
}

export namespace RefreshTokenController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
  }
}
