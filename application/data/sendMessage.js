// // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: process.env.AWS_REGION});

// Create sendEmail params 
// no notification
const sendMessage2 = async ({ senderEmailAddress, receiverEmailAddress, message }) => {
   if (!message.body || !message.subject) {
    throw new Error("Message body or subject is missing");
  }

  const params = {
    Destination: {
      ToAddresses: [receiverEmailAddress]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: message.body // Use the body content from the structured message
        },
        Text: {
          Charset: "UTF-8",
          Data: message.body // Use the body content from the structured message for text as well
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: message.subject // Use the subject from the structured message
      }
    },
    Source: senderEmailAddress,
    ReplyToAddresses: [receiverEmailAddress]
  };
  // Create the promise and SES service object
var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    // console.log(data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });

};

// const sns = new AWS.SNS();
// const ses = new AWS.SES();

// const sendMessageUserOneNotif = async ({ senderEmailAddress, receiverEmailAddress, message, gameId, user1, user2, boardState }) => {
//   const params = {
//     Email: 
//   };

//   return sns.publish(params).promise()
// }
// `${user1} just made a move`
// sendMessageUserOneNotif({senderEmailAddress: process.env.SENDEREMAIL, receiverEmailAddress: "abigaylerose03@gmail.com", message: 'Hello from SES', gameId: "a", user1: "test", user2: "test" })
//   .then(() => console.log('Sent message successfully'))
//   .catch((error) => console.log('Error sending SNS: ', error.message))


// TODO: figure out receiver
// sendMessage2({senderEmailAddress: process.env.SENDEREMAIL, receiverEmailAddress: "abigaylerose03@gmail.com", message: 'Hello from SES' })
//   .then(() => console.log('Sent message successfully'))
//   .catch((error) => console.log('Error sending SNS: ', error.message))

module.exports = sendMessage2;
// module.exports = sendMessageUserOneNotif;