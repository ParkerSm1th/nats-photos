import AWS from "aws-sdk";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  endpoint: "gateway.storjshare.io",
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  httpOptions: { timeout: 0 },
});

export class S3Service {
  bucketName: string;
  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }
  getPresignedLink(key: string, expiryInSeconds: number): string {
    const link = s3.getSignedUrl("getObject", {
      Bucket: "photos",
      Key: key,
      Expires: expiryInSeconds,
    });
    // Weird vercel bug, it appends this odd trace
    const splitLink = link.split("&X-Amzn-Trace-Id");
    return splitLink[0] ? splitLink[0] : link;
  }
  getPresignedUploadLink(
    info: {
      key: string;
      type: string;
    },
    expiryInSeconds: number
  ): string {
    const link = s3.getSignedUrl("putObject", {
      Bucket: "photos",
      Key: info.key,
      Expires: expiryInSeconds,
      ContentType: info.type,
    });
    console.log("S3Service", link);
    // Weird vercel bug, it appends this odd trace
    const splitLink = link.split("&X-Amzn-Trace-Id");
    return link;
  }
}
