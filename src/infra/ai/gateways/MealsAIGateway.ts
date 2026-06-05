import z from "zod";
import OpenAI, { toFile } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealsFileStorageGateway } from "../../gateways/MealsFileStorageGateway";
import { getImagePrompt } from "../prompts/getImagePrompt";
import { downloadFileFromURL } from "src/utils/downloadFileFromURL";
import { getTextPrompt } from "../prompts/getTextPrompt";
import { ChatCompletionContentPart } from "openai/resources/index.js";
import { dateToLocaleUTC } from "@shared/utils/dateToLocaleUTC";

const mealSchema = z.object({
  name: z.string(),
  icon: z.string(),
  foods: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    calories: z.number(),
    carbohydrates: z.number(),
    fats: z.number(),
    proteins: z.number(),
  })),
});

@Injectable()
export class MealsAIGateway {
  constructor(
    private readonly mealsFileStorageGateway: MealsFileStorageGateway,
  ) { }

  private readonly client = new OpenAI();

  async processMeal(meal: Meal): Promise<MealsAIGateway.ProcessMealResult> {
    const mealFileURL = this.mealsFileStorageGateway.getFileURL(meal.inputFileKey);

    if (meal.inputType === Meal.InputType.PICTURE) {
      return this.callAI({
        mealId: meal.id,
        systemPrompt: getImagePrompt(),
        userMessagesParts: [
          {
            type: 'image_url',
            image_url: {
              url: mealFileURL,
              detail: 'high'
            }
          },
          {
            type: 'text',
            text: `Meal date: ${meal.createdAt}`
          }
        ]
      })
    }

    const trascribed = await this.transcribe(mealFileURL);

    return this.callAI({
      mealId: meal.id,
      systemPrompt: getTextPrompt(),
      userMessagesParts: `Meal date: ${dateToLocaleUTC(meal.createdAt)}\n\nMeal: ${trascribed}`,
    })
  }

  private async transcribe(audioFileURL: string) {
    const audioFile = await downloadFileFromURL(audioFileURL);

    const { text } = await this.client.audio.transcriptions.create({
      model: 'whisper-1',
      file: await toFile(audioFile, 'audio.m4a', { type: 'audio/m4a' }),
    });

    return text;
  }

  private async callAI({ mealId, systemPrompt, userMessagesParts }: MealsAIGateway.CallMealAIParams) {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: zodResponseFormat(mealSchema, 'meal'),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessagesParts,
        }

      ]
    });

    const json = response.choices[0].message.content;

    if (!json) {
      console.error('OpenAI response:', JSON.stringify(response, null, 2));

      throw new Error(`Failed processing meal "${mealId}"`);
    }

    const { success, data, error } = mealSchema.safeDecode(JSON.parse(json));

    if (!success) {
      console.log('Zod error:', JSON.stringify(error.issues));
      console.error('OpenAI response:', JSON.stringify(response, null, 2));
      throw new Error(`Failed processing meal "${mealId}"`);
    }

    return data;
  }
}

export namespace MealsAIGateway {
  export type ProcessMealResult = {
    name: string;
    icon: string;
    foods: Meal.Food[];
  }

  export type CallMealAIParams = {
    mealId: string;
    systemPrompt: string;
    userMessagesParts: string | ChatCompletionContentPart[]
  }
}