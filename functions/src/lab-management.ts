import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getUserSID, isUserLoggedIn} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";

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

  const unSanLabName = request.data.labName;
  // Checking unsanitised lab name exists in request.
  if (!(typeof unSanLabName === "string") || unSanLabName.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a labName."
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const newLabReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await newLabReference.get();

  // if already exists throw error
  if (docSnapshot.exists) {
    throw new HttpsError(
      "already-exists",
      "Sorry this lab name already exists"
    );
  } else {
    // create a lab
    const userSID = getUserSID(request);
    await newLabReference.set({
      id: sanLabName,
      name: unSanLabName,
      owner: userSID,
      sop: "",
      users: [{id: userSID, approved: true}],
    });
  }

  return {sanLabName};
});
