import { ErrorCode } from "@application/erros/ErrorCode";

interface lambdaErrorResponseParams {
  statusCode: number;
  code: ErrorCode;
  message: any;
}

export function lambdaErrorResponse({ statusCode, code, message }: lambdaErrorResponseParams) {
  return {
    statusCode,
    body: JSON.stringify({
      error: {
        code,
        message
      }
    })
  }
}
