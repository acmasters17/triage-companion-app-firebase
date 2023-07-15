import {HttpsError, onCall} from "firebase-functions/v2/https";
import {userLoggedInAndLabNameExists} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";

// gets uploaded SOP Name
export const getUploadedSOPName = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists find user within users and return approved field
  if (docSnapshot.exists) {
    const sopName: string = docSnapshot.get("sopName");

    return {sopName: sopName};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please contact support"
    );
  }
});

// updates the SOP name that is uploaded
export const updateUploadedSOPName = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const newSOPName = request.data.newSOPName;

  if (!(typeof newSOPName === "string") || newSOPName.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a sop name"
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists update the sopName with the new name
  if (docSnapshot.exists) {
    await labReference.set({sopName: newSOPName}, {merge: true});

    return {success: true};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please contact support"
    );
  }
});
