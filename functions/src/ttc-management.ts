import {HttpsError, onCall} from "firebase-functions/v2/https";
import {userLoggedInAndLabNameExists} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";

// get technicalTriageChecklist
export const getTTChecklist = onCall(async (request) => {
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
    const technicalTriageChecklist: any = docSnapshot.get(
      "technicalTriageChecklist"
    );

    return {technicalTriageChecklist: technicalTriageChecklist};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// update techTriageChecklist
export const updateTTChecklist = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const newTechnicalTriageChecklist = request.data.newTechnicalTriageChecklist;

  if (!Array.isArray(newTechnicalTriageChecklist)) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a valid new tech triage checklist to update"
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
    await labReference.set(
      {technicalTriageChecklist: newTechnicalTriageChecklist},
      {merge: true}
    );

    return {success: true};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from support"
    );
  }
});
