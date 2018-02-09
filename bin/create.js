const AWS = require('aws-sdk');

if (process.env.DYNAMODB_URL) {
  AWS.config.update({
    region: 'us-west-2',
    endpoint: process.env.DYNAMODB_URL
  });
}


const dynamodb = new AWS.DynamoDB();

const params = {
  TableName : 'auth',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH'}
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 1
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});