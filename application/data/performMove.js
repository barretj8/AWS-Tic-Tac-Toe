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
    const updatedResponse = await documentClient.update(updateParams).promise();
    
    try {
        
        let userOne = updatedResponse.Attributes.user1;
        let userTwo = gameData.Item.user2;
        let lastMove = gameData.Item.lastMoveBy;
        let gms = gameData.Item.gameState;
        
        console.log('Player:', player);
        console.log('Previous Move Done By:', lastMove);
        console.log('Creator:', userOne);
        console.log('Opponent:', userTwo);
        

        // Determine the sender and receiver emails based on the current player's move
        let senderEmail = userOne; // need to switch these around
        let receiverEmail = userTwo;
        if (player === 'Opponent') {
            // If the opponent makes the move, swap the sender and receiver emails
            [senderEmail, receiverEmail] = [receiverEmail, senderEmail];
        }

        const currentPlayer = player === 'Creator' ? userOne : userTwo;
        const receiver = player === 'Creator' ? userTwo : userOne;
        

        const message = {
            subject: `Move in Tic Tac Toe Game: ${updatedResponse.Attributes.gameId}`,
            body: `Hi ${receiver}! There has been a move in your game, ${updatedResponse.Attributes.gameId}. This move was done by ${currentPlayer}. Here is the current game state: ${updatedResponse.Attributes.gameState}`
            
        };

        sendMessage2({
            senderEmailAddress: senderEmail,
            receiverEmailAddress: receiverEmail,
            message: message
        })
        .then(() => console.log('Sent move updates successfully'))
        .catch((error) => console.log('Error sending SES: ', error.message));
        
    } catch (error) {
        console.log('Error updating game: ', error.message);
    }
    return {
        user1: updatedResponse.Attributes.user1,
        user2: gameData.Item.user2,
        symbol: symbol,
        player: player,
        position: position
    };
};

module.exports = performMove;