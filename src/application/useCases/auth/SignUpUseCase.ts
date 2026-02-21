import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class SignUpUseCase {
  async execute(input: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    return {
      accessToken: 'gerou papai',
      refreshToken: 'gerou o refresh papai'
    };
  }
}

export namespace SignUpUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  }
}
