import 'reflect-metadata';

import { MealFileUploadedEventHandler } from "@application/events/files/MealFileUploadedEventHandler";
import { lambdaS3Adapter } from "@main/adapters/lambdaS3Adapter";

export const handler = lambdaS3Adapter(MealFileUploadedEventHandler);