# AWS-Tic-Tac-Toe

1. Group Members: Jadyn Barrett
2. API Gateway: https://lwu2s3d8oc.execute-api.us-east-1.amazonaws.com/prod
3. Instructions for CLI Usage:
   1. Make sure you are in the AWS-Tic-Tac-Toe Directory. Run 'source env2.sh'
   2. cd into application and then run 'node app.js'
   3. You will be asked if you want to register or login.
        1. Register:
             1. Enter your email
             2. Enter your password. Your input will be hidden.
             3. Run 'node app.js' and move to Login step
        2. Login:
             1. Enter your email
             2. Enter your password
             3. After getting the Login Successful output, it asks you: 'What do you want to do?'. You have three choices, Create a Game, Join Game, and Register a New Player.
                  1. Create a Game:
                       1. You will be asked to enter the email of who you want to play with, your opponent.
                       2. The game will send the creator -- the one who created the game, and the opponent an SNS Subscription opt-in. Make sure to click on the link as this makes sure you get the correct game updates. The opponent will also get an email with a game Id to join your game. 
                       3. Run 'node app.js' and move to Join Game step
                  2. Join Game:
                       1. Login with either the creator's email or the opponent's email.
                       2. Join the game and enter the game Id sent to the opponent's email.
                  3. Register a New Player:
                       1. Repeat the register steps
   4. Playing the Game: Now that you're all set up to play the game, whichever email you signed in with will be the first player to go. Input a number 0 though 8. Pressing enter will confirm your move and will send a game update to the other player saying it's their turn to move. The way the game is set up, one person is able to play by themselves and the emails will switch off with each move, keeping track of their own inputs. You will switch between the creator and opponent until one player wins the game! At this point, a message will be sent to both emails stating the game is over and congratulating the winner.
4. Challenges Encountered: The most challenging part of this assignment was getting the win conditions to work. I had a very difficult time getting the game to stop after a player got three in a row.
5. Buggy/Unimplemented Features: With more time, I would have liked to make the registering/logging-in and creating a game more seamless so you didn't have to restart the program as often. Also, I would have liked to figure out how to display a previous game board before the player had to move if the user re-joined the game.


