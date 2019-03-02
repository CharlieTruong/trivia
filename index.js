import axios from "axios";

const respond = (
  response,
  sessionAttributes = {},
  shouldEndSession = false
) => ({
  response: {
    shouldEndSession,
    outputSpeech: {
      type: "PlainText",
      text: response
    }
  },
  sessionAttributes,
  version: "1.0"
});

exports.handler = async (event, context, callback) => {
  try {
    switch (event.request.type) {
      case "LaunchRequest":
        callback(null, respond("Welcome to comic book trivia"));
        break;
      case "SessionEndedRequest":
        callback(null, respond("See you next time"));
        break;
      case "IntentRequest":
        const { name } = event.request.intent;
        switch (name) {
          case "getQuestion":
            const questionResponse = await axios.get(
              "http://jsservice.io/random"
            );
            const question = questionResponse[0].data;
            callback(null, respond("here is a question", question));
            break;
          case "answerQuestion":
            break;
          default:
            callback(null, respond(`Intent type is ${name}`));
            break;
        }
        break;
    }
  } catch (e) {
    callback(`Error: ${e}`);
  }
};
