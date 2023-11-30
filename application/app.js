// module.exports = app;
// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: MIT-0
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const { createGame, fetchGame, performMove, handlePostMoveNotification } = require("./data");
const { createCognitoUser, login, fetchUserByUsername, verifyToken } = require("./auth");
const { validateCreateUser, validateCreateGame, validatePerformMove } = require("./validate");


const inquirer = require("inquirer");

async function joinOrCreateGame(token) {
   const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: ['Create Game', 'Join Game', 'Register a New Player']
        }
    ]);

    if (action === 'Create Game') {
        await createNewGame(token);
    } else if (action === 'Join Game') {
        console.log("join Game");
        await joinGame(token); // token?
    } else if (action === 'Register a New Player') {
        await registerUser();
    }
}


async function main() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: ['Register', 'Login']
        }
    ]);

    if (action === 'Register') {
        await registerUser();
    } else if (action === 'Login') {
        await loginUser();
    }
}

async function registerUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
       
    ]);

    try {
        const user = await createCognitoUser(answers.email, answers.password);
        console.log('User created successfully:', user);
        // loginUser();
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function loginUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'username', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
    ]);

    try {
        const token = await login(answers.username, answers.password);
        console.log('Login successful.');
        joinOrCreateGame(token);
        
    } catch (error) {
        console.error('Login failed:', error);
    }
}

async function getPlayerMove(player) {
    const { position } = await inquirer.prompt([
        {
            type: 'input',
            name: 'position',
            message: `${player}'s turn. Enter position (0-8) This is 0-indexed:`,
            validate: input => {
                // Ensure the input is a number between 0 and 8
                return !isNaN(input) && input >= 0 && input < 9;
            }
        }
    ]);
    return parseInt(position, 10);
}


// Helper function to format the game state into a 3x3 board
const formatGameState = (gameState) => {
    let formattedBoard = '';
    for (let i = 0; i < gameState.length; i++) {
        formattedBoard += gameState[i] + ' ';
        if ((i + 1) % 3 === 0) formattedBoard += '\n';
    }
    return formattedBoard;
};

async function createNewGame(token) {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter email of opponent:' }
    ]);

    try {
        let userEmail='';
        
        verifyToken(token).then(decodedToken => {
            // HDecodedToken contains the user's information.
            userEmail = decodedToken.email;
          })
          .catch(error => {
            // Handle any errors that occur during token verification
            console.error("Token verification failed:", error);
          });
          
        const opponent = await fetchUserByUsername(answers.email);
        const opponentEmail = opponent.email;
        const game = await createGame({
          creator: userEmail,
          opponent: opponentEmail
        });
              
    } catch (error) {
        console.error('Create new game failed:', error);
    }
}

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


async function playGame(gameId, token, creator) {
    const getParams = {
        TableName: 'turn-based-game',
        Key: { gameId: gameId }
    };
    const gameData = await documentClient.get(getParams).promise();
    let isGameEnded = false;
    
    // Print initial board
    let gameState = '---------'; // Initial game state of the board
    let formatgs = formatGameState(gameState);
    
    console.log('\n');
    console.log(formatgs);

    let userEmail = '';
    let currentPlayer = '';
    
    verifyToken(token).then(decodedToken => {
        // DecodedToken contains the user's information.
        userEmail = decodedToken.email;
        currentPlayer = userEmail === gameData.Item.user1 ? 'Creator' : 'Opponent';
        
    // Handle any errors that occur during token verification
    }).catch(error => {console.error("Token verification failed:", error);});

    // while (!isGameEnded) {
    //     await new Promise(resolve => setTimeout(resolve, 250));
    //     const position = await getPlayerMove(currentPlayer);
    //     const symbol = currentPlayer === 'Creator' ? 'X' : 'O';
        
    //     try {
    //         const game = await performMove({ gameId, player: currentPlayer, position, symbol });
    //         let opponent;
    //         if (game.user1 !== game.lastMoveBy) {
    //             opponent = game.user1;
    //           } else {
    //             opponent = game.user2;
    //           }
    //         const opponentPlayer = await fetchUserByUsername(opponent);
    //         const currentMover = {username : userEmail};
    //         console.log('game right before checking for winner conditions', game);
    //         const CheckforWinner = await handlePostMoveNotification(game, currentMover, opponentPlayer); //formattedGameStateForEmail
    //         if(CheckforWinner) {
    //             console.log("inside the if statement to check if the winner is not null");
    //             isGameEnded = true;
    //         }
    //         currentPlayer = currentPlayer === 'Creator' ? 'Opponent' : 'Creator';    
    //     } catch (error) {
    //         console.error('Error when playing game:', error.message);
    //         continue; // If move is invalid, retry
    //     }
    // }
    while (!isGameEnded) {
        await new Promise(resolve => setTimeout(resolve, 250));
        const position = await getPlayerMove(currentPlayer);
        const symbol = currentPlayer === 'Creator' ? 'X' : 'O';

        try {
            const game = await performMove({ gameId, player: currentPlayer, position, symbol });
            // console.log('gamestate:', game.gameState);
            let opponent;
            if (game.user1 !== game.lastMoveBy) {
                opponent = game.user1;
              } else {
                opponent = game.user2;
              }
            const opponentPlayer = await fetchUserByUsername(opponent);
            const currentMover = {username : userEmail};
            const winnerCheck = handlePostMoveNotification(game.gameState);
            
            if (winnerCheck) {
                // console.log(`Player ${winnerCheck} wins!`);
                break;
                // Handle the scenario where the game ends with a winner
            } else {
                console.log("No winner yet. Keep playing!");
                // Continue the game
                currentPlayer = currentPlayer === 'Creator' ? 'Opponent' : 'Creator';
            }
        } catch (error) {
            console.error('Error when playing game:', error.message);
            continue; // If move is invalid, retry
        }
    }
}

async function joinGame(token) {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'gameId', message: 'Enter game id:' }
    ]);

    try {
        const game = await fetchGame(answers.gameId);
        if (!game) {
            throw new Error("Game not found.");
        }
        
        await playGame(answers.gameId, token);
        
    } catch (error) {
        console.error('Join game failed:', error.message);
    }
}

main();
