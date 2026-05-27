import KSUID from "ksuid";
import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3Client } from "@infra/clients/s3Client";
import { AppConfig } from "@shared/config/AppConfig";
import { minutesToSeconds } from "@shared/utils/minutesToSeconds";


@Injectable()
export class MealsFileStorageGateway {
  constructor(
    private readonly config: AppConfig,
  ) { }

  static generateInputFileKey({ accountId, inputType }: MealsFileStorageGateway.GenerateInputFileKeyParams): string {
    const extension = inputType === Meal.InputType.AUDIO ? 'm4a' : 'jpeg';
    const filename = `${KSUID.randomSync().string}.${extension}`;

    return `${accountId}/${filename}`;
  }

  getFileURL(fileKey: string) {
    return `https://${this.config.cdn.mealsCDN}/${fileKey}`;
  }

  async createPOST({
    file, 
    mealId,
    accountId
  }: MealsFileStorageGateway.CreatePOSTParams): Promise<MealsFileStorageGateway.CreatePOSTResult> {
    const bucket = this.config.storage.mealsBucket;
    const contentType = file.inputType === Meal.InputType.AUDIO ? 'audio/m4a' : 'image/jpeg';

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: file.key,
      Expires: minutesToSeconds(5),
      Conditions: [
        { bucket },
        ['eq', '$key', file.key],
        ['eq', '$Content-Type', contentType],
        ['content-length-range', file.size, file.size]
      ],
      Fields: {
        'x-amz-meta-mealid': mealId,
        'x-amz-meta-accountId': accountId
      }
    });

    const uploadSignature = Buffer.from(
      JSON.stringify({
        url,
        fields: {
          ...fields,
          'Content-Type': contentType
        }
      })
    ).toString('base64');

    return {
      uploadSignature
    }
  }
}

export namespace MealsFileStorageGateway {
  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: Meal.InputType;
  };

  export type CreatePOSTParams = {
    mealId: string;
    accountId: string;
    file: {
      key: string;
      size: number;
      inputType: Meal.InputType;
    }
  }

  export type CreatePOSTResult = {
    uploadSignature: string;
  }
}