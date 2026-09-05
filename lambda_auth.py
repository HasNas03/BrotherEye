# AWS `facial_authentication` Lambda function code below (paste into code source in console)

# call AWS services / use for json response
import boto3, json
# need s3 to get image from
s3 = boto3.client('s3')
# need rekognition to index image
rekognition = boto3.client('rekognition', region_name='ca-central-1')
# need dynamodb to store image metadata
dynamodb = boto3.client('dynamodb', region_name='ca-central-1')
# instantiate variable to represent table
dynamodbTableName = 'rekogdb'
faceTable = dynamodb.Table(dynamodbTableName)
# specify bucket
bucketName = 'input-pic-bucket'

def lambda_handler(event, context):
    # for debugging
    print(event)

    # lambda triggered from APIG, extract file name from request param
    objectKey = event['queryStringParameters']['objectKey']
    # IMPORTANT: does not index, but compares input against faces in collection similar to uploaded face,
    # and returns most matching stored face (for DB to receive and send full name back)
    response = rekognition.search_faces_by_image(
        CollectionId='faces',
        Image={
            'S3Object': 
            {
            'Bucket': bucketName,
            'Name': objectKey
            }
        }  
    )

    for match in response['FaceMatches']:
        # get id/confidence of the registered face from the collection
        matchId = match['Face']['FaceId']
        matchConfidence = match['Face']['Confidence'] # response is ordered by highest confidence first
        print (matchId, matchConfidence)
        # check database for match using id
        face = faceTable.get_item(
            Key={
                'rekognitionId': matchId
            }
        )
        if 'Item' in face: 
            print('Person Found: ', face['Item'])
            return buildResponse(200, {
                'Message': 'Success',
                'firstName': face['Item']['firstName'],
                'lastName': face['Item']['lastName']
            })
        print('Person could not be found.')
        return buildResponse(403, {'Message': 'Person not found...'})
    
def buildResponse(statusCode, body=None):
    response={
        'statusCode': statusCode,
        'headers':{
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body)
    return response