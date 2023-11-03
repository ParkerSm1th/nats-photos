import AWS from "aws-sdk";

const ep = new AWS.Endpoint("s3.wasabisys.com");
AWS.config.update({
  region: "us-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const s3 = new AWS.S3({ endpoint: ep });

export class S3Service {
  bucketName: string;
  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }
  getPresignedLink(key: string, expiryInSeconds: number): string {
    const link = s3.getSignedUrl("getObject", {
      Bucket: "natalies-photos",
      Key: key,
      Expires: expiryInSeconds,
    });
    // Weird vercel bug, it appends this odd trace
    const splitLink = link.split("&X-Amzn-Trace-Id");
    return splitLink[0] ? splitLink[0] : link;
  }
}
