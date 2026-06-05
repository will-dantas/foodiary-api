import 'reflect-metadata';

import { MealsQueueConsumer } from "@application/queue/MealsQueueConsumer";
import { lambdaSQSAdapter } from "@main/adapters/lambdaSQSAdapter";

export const handler = lambdaSQSAdapter(MealsQueueConsumer);