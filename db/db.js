// Install AWS SDK if not already done
// npm install aws-sdk

const AWS = require("aws-sdk");

// Configure DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Tables (DynamoDB does not require explicit table creation in code)
const createTables = async () => {
  const dynamodb = new AWS.DynamoDB();

  const playersTable = {
    TableName: "players",
    KeySchema: [
      { AttributeName: "uid", KeyType: "HASH" }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: "uid", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  const gamesTable = {
    TableName: "games",
    KeySchema: [
      { AttributeName: "gid", KeyType: "HASH" }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: "gid", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    await dynamodb.createTable(playersTable).promise();
    await dynamodb.createTable(gamesTable).promise();
    //prod-commented console.log("DynamoDB Tables Initialized.");
  } catch (error) {
    if (error.code !== "ResourceInUseException") {
      console.error("Error initializing tables:", error);
    }
  }
};

createTables();

// Function to log table name and record count
// Function to count and log all records for a table
// async function logTableRecordCount(tableName) {
//   try {
//     // Scan the table to get all items
//     const scanParams = {
//       TableName: tableName,
//     };

//     const data = await dynamoDb.scan(scanParams).promise();
//    //prod-commented console.log(`Table: ${tableName}`);
//    //prod-commented console.log(`Record count: ${data.Items.length}`);
//    //prod-commented console.log(data.Items);

//     // Delete all records
//   } catch (error) {
//     console.error(`Error logging table ${tableName}:`, error);
//   }
// }

// logTableRecordCount("players");
// logTableRecordCount("games");
module.exports = dynamoDb;
