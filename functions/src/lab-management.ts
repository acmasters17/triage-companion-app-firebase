import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getUserSID, isUserLoggedIn} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";
import * as admin from "firebase-admin";

// All functions related to creating, requesting access
// and managing access to labs
export const createLab = onCall(async (request) => {
  // Checking that the user is authenticated.
  if (!isUserLoggedIn(request)) {
    throw new HttpsError(
      "failed-precondition",
      "You must be logged in to create a lab."
    );
  }

  const labName = request.data.labName;
  // Checking lab name exists in request.
  if (!(typeof labName === "string") || labName.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a labName."
    );
  }

  // safe initialise if needed
  admin.initializeApp();

  // otherwise create a lab
  const firestore = getFirestore();

  await firestore
    .collection("labs")
    .doc("new-city-id")
    .set({name: "Los Angeles", state: "CA", country: "USA"});

  const userSID = getUserSID(request);

  return {uid: userSID};
});
