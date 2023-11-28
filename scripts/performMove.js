const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const sendMessage2 = require('./sendMessage');

// helper method
const clearGame = async ({gameId}) => {
    const getParams = {
        TableName: 'turn-based-game',
        Key: { gameId: gameId }
    };
    try {
        const gameData = await documentClient.get(getParams).promise();
         let gameState = gameData.Item.gameState;
         gameState = '---------';
         console.log(gameState);
    } catch (error) {
          console.log('Error updating game: ', error.message);
    }
};

// Helper function to format the game state into a 3x3 board
const formatGameState = (gameState) => {
    let formattedBoard = '';
    for (let i = 0; i < gameState.length; i++) {
        formattedBoard += gameState[i] + ' ';
        if ((i + 1) % 3 === 0) formattedBoard += '\n';
    }
    return formattedBoard;
};

// Helper function to format the game state into a 3x3 board for HTML emails
const formattedGameStateForEmail = (gameState) => {
    let formattedBoard = '<table style="border-collapse: collapse; font-size: 20px;"><tbody>';
    for (let i = 0; i < gameState.length; i++) {
        if (i % 3 === 0) formattedBoard += '<tr>'; // Start new row every 3 characters
        formattedBoard += `<td style="border: 1px solid black; width: 30px; height: 30px; text-align: center;">${gameState[i]}</td>`;
        if ((i + 1) % 3 === 0) formattedBoard += '</tr>'; // End row every 3 characters
    }
    formattedBoard += '</tbody></table>';
    return formattedBoard;
};



const performMove = async ({ gameId, player, position, symbol }) => {
    if (!['X', 'O'].includes(symbol)) {
        throw new Error('Symbol must be X or O');
    }

    const getParams = {
        TableName: 'turn-based-game',
        Key: { gameId: gameId }
    };
    
    try {
        const gameData = await documentClient.get(getParams).promise();

        let gameState = gameData.Item.gameState || '---------'
        
        if (gameState[position] !== '-') {
            throw new Error('Cell is already occupied');
        }

        gameState = gameState.substring(0, position) + symbol + gameState.substring(position + 1);


        const updateParams = {
            TableName: 'turn-based-game',
            Key: { gameId: gameId },
            UpdateExpression: 'SET lastMoveBy = :player, gameState = :gs',
            ExpressionAttributeValues: {
                ':player': player,
                ':gs': gameState,
            },
            ReturnValues: 'ALL_NEW'
        };
        
        const resp = await documentClient.update(updateParams).promise();
        console.log('gameData.Item debud:', gameData.Item);
        // let userOne = resp.Attributes.user1
        // let userTwo = resp.Attributes.user2
        let lmb = gameData.Item.lastMoveBy
        let gms = gameData.Item.gameState
        console.log('Player:', player);
        // console.log('User1:', userOne);
        // console.log('User2:', userTwo);
        console.log('LastMoveBy:', lmb);

        
        // const formatEmailGameState = formattedGameStateForEmail(resp.Attributes.gameState);
        const formattedgms = formatGameState(resp.Attributes.gameState);
        console.log('Updated board:');
        console.log('\n');
        console.log(formattedgms);




        // // Construct the message containing move information and game state
        // const senderEmail = player === '1' ? userOne : userTwo;
        // const receiverEmail = player === '2' ? userOne : userTwo;
        // const currentPlayer = player === '1' ? userOne : userTwo;
        
        // if (player === '2') {
        //     // If player 2 makes the move, swap the sender and receiver emails
        //     [senderEmail, receiverEmail] = [receiverEmail, senderEmail];
        // }


        // const message = {
        //     subject: `Move in Tic Tac Toe Game: ${resp.Attributes.gameId}`,
        //     body: `Hi! There has been a move in your game, ${resp.Attributes.gameId}. This move was done by ${currentPlayer}. Here is the current game state: ${resp.Attributes.gameState}`
        // };

        // sendMessage2({
        //     senderEmailAddress: senderEmail,
        //     receiverEmailAddress: receiverEmail,
        //     message: message
        // })
        // .then(() => console.log('Sent move updates successfully'))
        // .catch((error) => console.log('Error sending SES: ', error.message));


    } catch (error) {
        console.log('Error updating game: ', error.message);
    }
};

// Tests
// performMove({ gameId: 'ae758d96', player: '2', position: 2, symbol: 'X' });
module.exports = performMove;