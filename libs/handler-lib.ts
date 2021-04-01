import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export class ResponseError extends Error {
  [key: string]: string;

  constructor(message, code) {
    super(message);
    this.name = "ResponseError";
    this.code = code;
  }
}

type LambdaFunction = (event: APIGatewayEvent, context: Context) => any;

/**
 * Handle a request of a passed lambda function
 * @param lambda - lambda function that will be requested
 */
export default function handler(lambda: LambdaFunction) {
  return async function (
    event: APIGatewayEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    let body: APIGatewayProxyResult | { error: string }, statusCode: number;

    try {
      // Run the Lambda
      body = await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      body = { error: e.message };
      statusCode = e.name === "ResponseError" ? e.code : 500;
    }

    // Return HTTP response
    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}

export const throwNotFoundError = (errorText: string): Error => {
  throw new ResponseError(errorText, 404);
};

export const isArrayEmpty = (arr: any[]): boolean => {
  return arr.length === 0;
};

export const isObjectEmpty = (obj: {}): boolean => {
  return Object.keys(obj).length === 0;
};
