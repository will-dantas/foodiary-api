/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';

const API_URL = 'https://api.easilytech.com.br/meals';
const TOKEN = 'eyJraWQiOiJXd0sxZGFZMDdld0FHTWxmN3pQSVhHaG1mdVE0MkJwZml6ZTAyWFlJalZjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9pdWlYVk1STXAiLCJjbGllbnRfaWQiOiI3dXY1dHFwbjZlcG1nb3FlYjBzZXZtbGxhaiIsIm9yaWdpbl9qdGkiOiI5ZDZmMjQ4YS1jMzQ3LTQ1YzYtODVjOC04YmI0OGNjZjcxNzgiLCJpbnRlcm5hbElkIjoiM0R5SnV3ZzBPa3g4d0hyOW94UGR3YjNFTEJaIiwiZXZlbnRfaWQiOiI2M2U0MzQ2YS00NGU1LTQyZTUtYmNhYy1iYzk1NzEyNTE2NjUiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzc5NDc4NTM4LCJleHAiOjE3Nzk1MjE3MzgsImlhdCI6MTc3OTQ3ODUzOCwianRpIjoiNDBiMjY2ZDgtYmI4MC00NGUxLWI2Y2ItYjBmMmNiOTRiYjc0IiwidXNlcm5hbWUiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUifQ.TD6u5bQtZTqsoNTZ9_KFQDRg8Z9h2durx4PB6Na4f5PBR6MDy0oRtsVkEasMh_oR5w-vrtWzXFC3syiOOplLIpXfQ44_XR_8lpI50TYY1UxxaqKit1F00TYohhM73OShruiHw1XUUSa-f9eYuh1FA35p4HvG3yqYwcuyFJZzYSfqpJwktw-J9wfjztQYqiWUoA-ySD-2aejipMMkYxNWSmEai-nnn3mz_czoTppviwRtf-_Bw9aSkWCavNXzpFkSpnTvuucaduzSprhXZRwii65b8U6m_mz3QwSzBw4RN2v7zpLaIOAg32vVcBxAP4J_5BsfwJGXCsZOJGJgGyT-tg';

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