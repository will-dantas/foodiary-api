import { IQueueComsumer } from "@application/contracts/IQueueConsumer";
import { SQSHandler } from "aws-lambda";

export function lambdaSQSAdapter(consumer: IQueueComsumer<any>): SQSHandler {
  return async (event) => {
    await Promise.allSettled(
      event.Records.map(async record => {
        const message = JSON.parse(record.body);

        await consumer.process(message);
      }),
    );
  };
}