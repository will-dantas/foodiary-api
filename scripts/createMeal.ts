/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';

const API_URL = 'https://api.easilytech.com.br/meals';
const TOKEN = 'eyJraWQiOiJXd0sxZGFZMDdld0FHTWxmN3pQSVhHaG1mdVE0MkJwZml6ZTAyWFlJalZjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9pdWlYVk1STXAiLCJjbGllbnRfaWQiOiI3dXY1dHFwbjZlcG1nb3FlYjBzZXZtbGxhaiIsIm9yaWdpbl9qdGkiOiIyZjFjZjcwYi02YjhlLTQyN2UtYTUxZS0wMDA4YjQ1YmZhMDAiLCJpbnRlcm5hbElkIjoiM0R5SnV3ZzBPa3g4d0hyOW94UGR3YjNFTEJaIiwiZXZlbnRfaWQiOiIxNjlhM2QxNC0wZjNjLTRiZjQtYmJlNS00MGQ2NGUxYjcyNWYiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzc5NDExNjc4LCJleHAiOjE3Nzk0NTQ4NzgsImlhdCI6MTc3OTQxMTY3OCwianRpIjoiNTA1OTkwNWEtZWI3OC00OGNjLWE4OTAtMDdjYmRlNWZmYmZlIiwidXNlcm5hbWUiOiI3NGU4YjQ4OC1jMDUxLTcwZTgtODRlZS05MGEyOGFmYjQ4ZGUifQ.HgOtiqZjawlmae18P-umVXE7p9_ZrJR-RqmWiGOH2VMvn70JPtAL_LJFhCkqSSp7RN5ejM6k28y8LF3yqFuF6k17VMTJBldG-OUGl1iTPzz7d9vMqEIavn00xlOY0041s8mh_zF7bsM8txycvKINYE4YnTsx5ZcVSr4kjUtPDNoHJ7Tf3ZoimpGr4YtcDFXnX5iGvXboxtWUsJx0OBWxQmUXr-cJ7cBdY2AvD3EZFIRfJzfRoylFVcrIJ-QK7tfhnJ66iIjTAusjOKk6q-z7flnV3_rbBRbSAyh5Yk9BQgS6WCCU5c-ipL8ceq77Pv9DqYNNffYb8FK3ZaHUirvkNw';

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