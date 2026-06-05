import { IQueueComsumer } from "@application/contracts/IQueueConsumer";
import { Registry } from "@kernel/di/Registry";
import { Constructor } from "@shared/types/constructor";
import { SQSHandler } from "aws-lambda";

export function lambdaSQSAdapter(queueConsumerImpl: Constructor<IQueueComsumer<any>>): SQSHandler {
  return async (event) => {
    const consumer = Registry.getInstance().resolve(queueConsumerImpl);

    await Promise.allSettled(
      event.Records.map(async record => {
        const message = JSON.parse(record.body);

        await consumer.process(message);
      }),
    );
  };
}