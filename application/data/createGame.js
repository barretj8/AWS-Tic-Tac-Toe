const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const {sendMessage2} = require('./sendMessage');

AWS.config.update({ region: 'us-east-1' });

const createGame = async ({ creator, opponent }) => {
    try {
        // Generate unique game ID
        const gameId = uuidv4().split('-')[0];

        // Define DynamoDB parameters for game creation
        const params = {
            TableName: 'turn-based-game',
            Item: {
                gameId,
                user1: creator,
                user2: opponent,
                gameState: '---------',
                winner: null,
                lastMoveBy: creator
            }
        };
        console.log("\nCreator:", creator);
        console.log("Opponent:", opponent);

        // Put game details in DynamoDB
        await documentClient.put(params).promise();
        console.log('\nGame created successfully\n');

        // Create an SNS client
        const ses = new AWS.SNS();

        // Create a game-specific SNS topic
        const topicParams = {
            Name: `Game_${gameId}_Updates`
        };

        // Create the SNS topic
        const topic = await ses.createTopic(topicParams).promise();
        const topicArn = topic.TopicArn;
        console.log('Created SNS topic for game');

        const subscribeParamsCreator = {
            Protocol: 'email',
            TopicArn: topicArn,
            Endpoint: creator,
            Attributes: {
                FilterPolicy: JSON.stringify({
                    'userId': [creator]
                })
            }
        };
        
        const subscribeParamsOpponent = {
            Protocol: 'email',
            TopicArn: topicArn,
            Endpoint: opponent,
            Attributes: {
                FilterPolicy: JSON.stringify({
                    'userId': [opponent]
                })
            }
        };

        // Subscribe creator to the SNS topic
        const subscriptionCreator = await ses.subscribe(subscribeParamsCreator).promise();
        console.log('Subscribed creator to game topic:', subscriptionCreator.SubscriptionArn);

        // Subscribe opponent to the SNS topic
        const subscriptionOpponent = await ses.subscribe(subscribeParamsOpponent).promise();
        console.log('Subscribed opponent to game topic:', subscriptionOpponent.SubscriptionArn);

        // Sending invite message
        const message = {
            subject: `Join ${creator} and Play Tic Tac Toe!`,
            body: `Hi ${opponent}, your friend ${creator} has invited you to a game of Tic Tac Toe! Your game ID is ${gameId}`
        };

        // sendMessage2({
        //     senderEmailAddress: creator,
        //     receiverEmailAddress: opponent,
        //     message: message
        // })
        //     .then(() => console.log('Sent invite message successfully'))
        //     .catch((error) => console.log('Error sending SES: ', error.message));

        return params.Item; // Return game details
    } catch (error) {
        console.error('Error creating game:', error);
        throw new Error('Could not create game');
    }
};

module.exports = createGame;
