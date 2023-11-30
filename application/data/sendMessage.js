// // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: process.env.AWS_REGION});

// Create sendEmail params 
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

const ses = new AWS.SES();

module.exports = sendMessage2;