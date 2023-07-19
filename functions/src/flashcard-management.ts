import {HttpsError, onCall} from "firebase-functions/v2/https";
import {userLoggedInAndLabNameExists} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";

// get flash cards
export const getFlashCardsChecklist = onCall(async (request) => {
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

  // if exists get the flashcards
  if (docSnapshot.exists) {
    const flashCards: [string] = docSnapshot.get("flashCards");

    return {flashCards: flashCards};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// update flashcards
export const updateFlashCardsChecklist = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const newFlashCards = request.data.newFlashCards;

  if (
    !Array.isArray(newFlashCards) ||
    !newFlashCards.every((item) => typeof item === "string")
  ) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a valid new set of flashcards to update"
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists then update flashcards with new ones passed
  if (docSnapshot.exists) {
    await labReference.set({flashCards: newFlashCards}, {merge: true});

    return {success: true};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});
