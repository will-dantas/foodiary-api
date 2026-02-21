import { ZodError } from "zod";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ErrorCode } from "@application/erros/ErrorCode";
import { HttpError } from "@application/erros/http/HttpError";
import { Controller } from "@application/contracts/Controller";
import { lambdaErrorResponse } from "@main/utils/lambdaErrorResponse";
import { lambdaBodyParser } from "@main/utils/lambdaBodyParser";


export function lambdaHttpAdapter(controller: Controller<unknown>) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      const body = lambdaBodyParser(event.body);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};

      const respose = await controller.execute({
        body,
        params,
        queryParams,
      });

      return {
        statusCode: respose.statusCode,
        body: respose.body ? JSON.stringify(respose.body) : undefined
      }
    }
    catch (error) {
      if (error instanceof ZodError) {
        return lambdaErrorResponse({
          statusCode: 400,
          code: ErrorCode.VALIDATION,
          message: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            error: issue.message,
          }))
        });
      }

      if (error instanceof HttpError) {
        return lambdaErrorResponse(error);
      }

      return lambdaErrorResponse({
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      });
    }
  }
}
