// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: MIT-0
// const express = require("express");
// const bodyParser = require("body-parser");
// const { createGame, fetchGame, performMove, handlePostMoveNotification } = require("./data");
// const {
//   createCognitoUser,
//   login,
//   fetchUserByUsername,
//   verifyToken
// } = require("./auth");
// const { validateCreateUser, validateCreateGame, validatePerformMove } = require("./validate");

// const app = express();
// app.use(bodyParser.json());

// function wrapAsync(fn) {
//   return function(req, res, next) {
//     fn(req, res, next).catch(next);
//   };
// }
// // Login
// app.post("/login", wrapAsync(async (req, res) => {
//   const idToken = await login(req.body.username, req.body.password);
//   res.json({ idToken });
// }));

// // Create user
// app.post("/users", wrapAsync(async (req, res) => {
//   const validated = validateCreateUser(req.body);
//   if (!validated.valid) {
//     throw new Error(validated.message);
//   }
//   const user = await createCognitoUser(
//     req.body.username,
//     req.body.password,
//     req.body.email
//     // req.body.phoneNumber (phone number req need to be removed)
//   );
//   res.json(user);
// }));

// // Create new game
// app.post("/games", wrapAsync(async (req, res) => {
//   const validated = validateCreateGame(req.body);
//   if (!validated.valid) {
//     throw new Error(validated.message);
//   }
//   const token = await verifyToken(req.header("Authorization"));
//   const opponent = await fetchUserByUsername(req.body.opponent);
//   const game = await createGame({
//     creator: token["cognito:username"],
//     opponent: opponent
//   });
//   res.json(game);
// }));

// // Fetch game
// app.get("/games/:gameId", wrapAsync(async (req, res) => {
//   const game = await fetchGame(req.params.gameId);
//   res.json(game);
// }));

// // Perform move
// app.post("/games/:gameId", wrapAsync(async (req, res) => {
//   const validated = validatePerformMove(req.body);
//   if (!validated.valid) {
//     throw new Error(validated.message);
//   }
//   const token = await verifyToken(req.header("Authorization"));
//   const game = await performMove({
//     gameId: req.params.gameId,
//     user: token["cognito:username"],
//     changedHeap: req.body.changedHeap,
//     changedHeapValue: req.body.changedHeapValue
//   });
//   let opponentUsername
//   if (game.user1 !== game.lastMoveBy) {
//     opponentUsername = game.user1
//   } else {
//     opponentUsername = game.user2
//   }
//   const opponent = await fetchUserByUsername(opponentUsername);
//   const mover = {
//     username: token['cognito:username']
//     // phoneNumber: token['phone_number']
//   }
//   await handlePostMoveNotification({ game, mover, opponent })
//   res.json(game);
// }));

// app.use(function(error, req, res, next) {
//   res.status(400).json({ message: error.message });
// });

// module.exports = app;
// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: MIT-0

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
            choices: ['Create game', 'Join game']
        }
    ]);

    if (action === 'Create game') {
        await createNewGame(token);
    } else if (action === 'Join game') {
        console.log("join game");
        await joinGame(token); // token?
    }
}

async function main() {
 //   const inquirer = await loadInquirer();
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

    // Additional CLI logic for your Tic Tac Toe game
}

async function registerUser() {
    // const answers = await inquirer.prompt([
    //     { type: 'input', name: 'username', message: 'Enter your username:' },
    //     { type: 'password', name: 'password', message: 'Enter your password:' },
    //     { type: 'input', name: 'email', message: 'Enter your email:' },
       
    // ]);

    // try {
    //     const user = await createCognitoUser(answers.username, answers.password, answers.email);
    //     console.log('User created successfully:', user);
    //     loginUser();
    // } catch (error) {
    //     console.error('Error creating user:', error);
    // }
    
     const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
       
    ]);

    try {
        const user = await createCognitoUser(answers.email, answers.password);
        console.log('User created successfully:', user);
        loginUser();
    } catch (error) {
        console.error('Error creating user:', error);
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
    return position;
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
    //    const token = await login(answers.email, answers.password);
     //   console.log('Create new game successful. Token:', token);
        // console.log(token);
        
        // Assuming idToken is the token you received after the user logs in
        let userEmail='';
        verifyToken(token)
          .then(decodedToken => {
            // Here, decodedToken contains the user's information.
             userEmail = decodedToken.email;
            console.log("User's email:", userEmail);
            
          })
          .catch(error => {
            // Handle any errors that occur during token verification
            console.error("Token verification failed:", error);
          });
          
        const opponent = await fetchUserByUsername(answers.email);
        const opponentEmail = opponent.email;
        console.log("opponent email", opponentEmail);
        // console.log("TOKEN", token);
        const game = await createGame({
          creator: userEmail,
          opponent: opponentEmail
        });
        
       
              
    } catch (error) {
        console.error('Create new game failed:', error);
    }
}


async function playGame(gameId, token, creator) {
    let isGameEnded = false;
    
    // Print initial board
    let gameState = '---------'; // Initial empty board
    let formatgs = formatGameState(gameState);
    
    console.log('\n');
    console.log(formatgs);
    // console.log('token', token);

    let userEmail = '';
    let currentPlayer = ''; // Declare currentPlayer outside the block
    
    verifyToken(token).then(decodedToken => {
        // Here, decodedToken contains the user's information.
        userEmail = decodedToken.email;
        console.log("User's email:", userEmail);
    
        // Assign userEmail to currentPlayer
        currentPlayer = '1';
        
    // Handle any errors that occur during token verification
    }).catch(error => {console.error("Token verification failed:", error);});

    while (!isGameEnded) {
        const symbol = currentPlayer === '1' ? 'X' : 'O'; // Map '1' to 'X', '0' to 'O'
        // await new Promise(resolve => setTimeout(resolve, 250));
        const position = await getPlayerMove(currentPlayer);

        try {

            const game = await performMove({ gameId, player: currentPlayer, position, symbol });
            console.log('test test');
            let opponentUsername;
            if (game.user1 !== game.lastMoveBy) {
                opponentUsername = game.user1
                console.log('opponent username is user1', opponentUsername);
              } else {
                opponentUsername = game.user2
                console.log('test 2');
              }
              const opponent = await fetchUserByUsername(opponentUsername);
              const mover = {username: userEmail}
              const result = await handlePostMoveNotification({ game, mover, opponent }) // win state
              if(result.isGameOver) {
                  break;
              }
              currentPlayer = currentPlayer === '1' ? '2' : '1';
        } catch (error) {
            console.error('error message when trying to performMove:', error.message);
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

        // console.log("got here");
        await playGame(answers.gameId, token);
        // console.log("made irt");
    } catch (error) {
        console.error('Join game failed:', error.message);
    }
}

// Ensure fetchGame and playGame are properly defined and handle errors



async function loginUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'username', message: 'Enter your username:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
    ]);

    try {
        const token = await login(answers.username, answers.password);
        console.log('Login successful.');
        // create game or join game
        joinOrCreateGame(token);
        
        // Store the token for future use in your application
    } catch (error) {
        console.error('Login failed:', error);
    }
}

main();
