import 'reflect-metadata';

import { MealFileUploadedEventHandler } from "@application/events/files/MealFileUploadedEventHandler";
import { Registry } from "@kernel/di/Registry";
import { lambdaS3Adapter } from "@main/adapters/lambdaS3Adapter";

const eventHandler = Registry.getInstance().resolve(MealFileUploadedEventHandler);

export const handler = lambdaS3Adapter(eventHandler);