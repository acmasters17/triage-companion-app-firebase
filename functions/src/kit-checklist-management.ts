import { HttpsError, onCall } from "firebase-functions/v2/https";
import { userLoggedInAndLabNameExists } from "./auth-utilities";
import { getFirestore } from "firebase-admin/firestore";

// get kit checklist
export const getKitChecklist = onCall(async (request) => {
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

  // if exists get the kit checklist
  if (docSnapshot.exists) {
    const kitChecklist: [string] = docSnapshot.get("kitChecklist");

    return { kitChecklist: kitChecklist };
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// update kit checklist
export const updateKitChecklist = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const newKitChecklist = request.data.newKitChecklist;

  if (
    !Array.isArray(newKitChecklist) ||
    !newKitChecklist.every((item) => typeof item === "string")
  ) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a valid new kit checklist to update"
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists then update kit checklist with new one passed
  if (docSnapshot.exists) {

    await labReference.set({kitChecklist: newKitChecklist}, {merge: true});

    return { success: true };
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});
