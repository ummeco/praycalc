import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// MinIO S3-compatible client
// Configure via env vars: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET, MINIO_REGION
export function isMinioConfigured(): boolean {
  return !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_BUCKET
  )
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

export async function createPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 300): Promise<string> {
  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

export async function createPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET!,
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

export async function deleteObject(key: string): Promise<void> {
  const client = createS3Client()
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.MINIO_BUCKET!,
    Key: key,
  }))
}

export function photoKey(deviceId: string, filename: string): string {
  return `tv-photos/${deviceId}/${filename}`
}
