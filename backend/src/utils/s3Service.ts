import { S3Client,PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export const uploadToS3 = async(fileBuffer:Buffer,fileName:string):Promise<string>=>{
    try {
        const command  = new PutObjectCommand({
            Bucket:BUCKET_NAME,
            Key:fileName,
            Body:fileBuffer,
            ContentType:'application/pdf'
        });
        await s3Client.send(command);
        
        // Generate a sifgned URL that expires in 7 days
        const getCommand = new GetObjectCommand({
            Bucket:BUCKET_NAME,
            Key:fileName
        });

        const signedUrl = await getSignedUrl(s3Client,getCommand,{expiresIn:604800});//7 days in seconds
        return signedUrl;
    } catch (error) {
        console.error("Error uploading to S3:",error);
        throw error;
    }
};