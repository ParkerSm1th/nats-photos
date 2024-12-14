import AWS from "aws-sdk";

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
      Bucket: process.env.NODE_ENV === "development" ? "photos-dev" : "photos",
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
      Bucket: process.env.NODE_ENV === "development" ? "photos-dev" : "photos",
      Key: info.key,
      Expires: expiryInSeconds,
      ContentType: info.type,
    });
    // Weird vercel bug, it appends this odd trace
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const splitLink = link.split("&X-Amzn-Trace-Id");
    return link;
  }
  async deleteObject(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      s3.deleteObject(
        {
          Bucket:
            process.env.NODE_ENV === "development" ? "photos-dev" : "photos",
          Key: key,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
