# AWS `facial-registration` Lambda function code below (paste into code source in console)

# call AWS services
import boto3
# need s3 to get image from
s3 = boto3.client('s3')
# need rekognition to index image
rekognition = boto3.client('rekognition', region_name='ca-central-1')
# need dynamodb to store image metadata
dynamodb = boto3.resource('dynamodb', region_name='ca-central-1')
# instantiate variable to represent table
dynamodbTableName = 'rekogdb' # name we gave table
faceTable = dynamodb.Table(dynamodbTableName) 

 
# define lambda function
def lambda_handler(event, context):
    # for debugging
    print(event) 

    # when triggered, 'event' will have bucketname and filename from uploaded image in s3
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # index the image via rekognition
    try:
        # indexes image to get rekognitionId
        response = index_image(bucket, key)
        # print(response) # debug
        # verify that indexing was successful
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            # 1. the unique rekognitionId
            faceId = response['FaceRecords'][0]['Face']['FaceId']
            # 2. get name from image (image will be named firstname_lastname.filetype)
            name = key.split('.')[0].split('_')
            firstName = name[0]
            lastName = name[1]
            # 3. save face data to database
            register_image(faceId, firstName, lastName)
        return response
    except Exception as e:
        print(e)
        print('Error processing image {} from bucket{}.', format(key, bucket))
        raise e

def index_image(bucket, key):
    response = rekognition.index_faces(
        Image={
            'S3Object': # reading from s3
            {
                'Bucket': bucket,
                'Name': key
            }
        },
        CollectionId="faces" # previously created via CLI
        # container for indexed faces, as newly added faces won't generate same Id but rather be 
        # compared against faces in collection and see what % of similarity they are -> returns the id of 
        # the already-indexed face that matched
    )
    return response

def register_image(faceId, firstName, lastName):
    faceTable.put_item(
        Item={
            'rekognitionId': faceId,
            'firstName': firstName,
            'lastName': lastName
        }
    )