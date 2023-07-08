/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {HttpsError, onCall, onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {createLab} from "./lab-management";


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// [START v2messageFunctionTrigger]
// Saves a message to the Firebase Realtime Database but sanitizes the
// text by removing swearwords.
export const testAuthenticated = onCall((request) => {
  // [START_EXCLUDE]
  // [START v2readMessageData]
  // Message text passed from the client.
  const text = request.data.text;
  // [END v2readMessageData]
  // [START v2messageHttpsErrors]
  // Checking attribute.
  if (!(typeof text === "string") || text.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "The function must be called " +
        "with one arguments `text` containing the message text to add."
    );
  }
  // Checking that the user is authenticated.
  if (!request.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "failed-precondition",
      "The function must be " + "called while authenticated."
    );
  }
  // [END v2messageHttpsErrors]

  // [START v2authIntegration]
  // Authentication / user information is automatically added to the request.
  const uid = request.auth.uid;
  const name = request.auth.token.name || null;
  const picture = request.auth.token.picture || null;
  const email = request.auth.token.email || null;
  // [END v2authIntegration]

  // [START v2returnMessageAsync]
  // Saving the new message to the Realtime Database.

  return {uid: uid, name: name, picture: picture, email: email};
});
// [END v2messageFunctionTrigger]

export {createLab};
