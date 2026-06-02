/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';

const API_URL = 'https://api.easilytech.com.br/meals';
const TOKEN = 'eyd0sxZGFZMDdld0FHTWxmN3pQSVhHaG1mdVE0MkJwZml6ZTAyWFlJalZjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUiLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9pdWlYVk1STXAiLCJjbGllbnRfaWQiOiI3dXY1dHFwbjZlcG1nb3FlYjBzZXZtbGxhaiIsIm9yaWdpbl9qdGkiOiI2YWU2OTJiZC1hNzIwLTQwYzgtODUxNC04NDEyOGVlM2M2OTMiLCJpbnRlcm5hbElkIjoiM0R5SnV3ZzBPa3g4d0hyOW94UGR3YjNFTEJaIiwiZXZlbnRfaWQiOiI4MjAyY2NhNy0wNzliLTRmMmEtOTExOS0xNWYwY2JiYThkZjkiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzgwMzY1NDMzLCJleHAiOjE3ODA0MDg2MzMsImlhdCI6MTc4MDM2NTQzNCwianRpIjoiZWU3YTI5NjYtNjA1Mi00MDljLWI4MDYtYmZmNjU1ZTU0ZmJmIiwidXNlcm5hbWUiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUifQ.bq52GvwQcgkXdR181Gnk-rxMAS6yzb5-J-urJq9NKrcokAkZ1fy9ACAZxZ08YgAwaH2i4F-BRGjThMx4fO1ME6PFFI0BP_ho4vaVurs3gN2dAGGn1GRLgplIxbbPpYdMeXt1ppc1CsinWL4euR7bzsRRmtpTgWil3hSLoiINuA_pCN7TTxK0jzdY5ILU6m_GOj0I4U6qXSH9xK2mrPmjid7t31ycnfs6-wlkgpeIhEv7UCr16SdLOM9nHxOpVep3n0Jvmpk2XHL5YJo4rk59PX0YOQBKobj-EcfrrQjEWR-4o8dCw5XNYVDAm6fQXv_zXvnGwLV4jukx5N1NKFdj5w';

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readFile(filePath: string, type: 'audio/m4a' | 'image/jpeg'): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  console.log(`🔍 Reading file from disk: ${filePath}`);
  const data = await fs.readFile(filePath);
  return {
    data,
    size: data.length,
    type,
  };
}

async function createMeal(
  fileType: string,
  fileSize: number,
): Promise<IPresignDecoded> {
  console.log(`🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ file: { type: fileType, size: fileSize } }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get presigned POST: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as IPresignResponse;
  const decoded = JSON.parse(
    Buffer.from(json.uploadSignature, 'base64').toString('utf-8'),
  ) as IPresignDecoded;

  console.log('✅ Received presigned POST data');
  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string,
): FormData {
  console.log(`📦 Building FormData with ${Object.keys(fields).length} fields and file ${filename}`);
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  const blob = new Blob([fileData as any], { type: fileType });
  form.append('file', blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText} — ${text}`);
  }

  console.log('🎉 Upload completed successfully');
}

async function uploadFile(filePath: string, fileType: 'audio/m4a' | 'image/jpeg'): Promise<void> {
  try {
    const { data, size, type } = await readFile(filePath, fileType);
    const { url, fields } = await createMeal(type, size);
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error('❌ Error during uploadFile:', err);
    throw err;
  }
}

uploadFile(
  path.resolve(__dirname, 'assets', './cover.jpeg'),
  'image/jpeg',
).catch(() => process.exit(1));