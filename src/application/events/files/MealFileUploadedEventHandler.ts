import { IFileEventHandler } from "@application/contracts/IFileEventsHandler";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class MealFileUploadedEventHandler implements IFileEventHandler {
  async handle({ fileKey }: IFileEventHandler.Input): Promise<void> {
    console.log({
      MealFileUploadedEventHandler: fileKey
    })
  }
}