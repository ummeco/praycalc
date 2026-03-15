import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// MinIO S3-compatible client
// Photo bucket: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET (praycalc-screensaver)
// Screenshot bucket: MINIO_SCREENSHOT_BUCKET (praycalc-screenshots) — same credentials

export function isMinioConfigured(): boolean {
  return !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_BUCKET
  )
}

function photoBucket(): string {
  return process.env.MINIO_BUCKET ?? 'praycalc-screensaver'
}

function screenshotBucket(): string {
  return process.env.MINIO_SCREENSHOT_BUCKET ?? 'praycalc-screenshots'
}

export function createS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT!,
    region: process.env.MINIO_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true, // Required for MinIO
  })
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
  bucket?: string,
): Promise<string> {
  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: bucket ?? photoBucket(),
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

export async function createPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
  bucket?: string,
): Promise<string> {
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: bucket ?? photoBucket(),
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

export async function deleteObject(key: string, bucket?: string): Promise<void> {
  const client = createS3Client()
  await client.send(new DeleteObjectCommand({
    Bucket: bucket ?? photoBucket(),
    Key: key,
  }))
}

export function photoKey(deviceId: string, filename: string): string {
  return `tv-photos/${deviceId}/${filename}`
}

export function screenshotKey(deviceId: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  return `screenshots/${deviceId}/screenshot-${ts}.png`
}

export async function createScreenshotUploadUrl(deviceId: string, expiresInSeconds = 300): Promise<{ uploadUrl: string; key: string }> {
  const key = screenshotKey(deviceId)
  const uploadUrl = await createPresignedUploadUrl(key, 'image/png', expiresInSeconds, screenshotBucket())
  return { uploadUrl, key }
}

export async function createScreenshotDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  return createPresignedDownloadUrl(key, expiresInSeconds, screenshotBucket())
}
