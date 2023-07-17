import {HttpsError, onCall} from "firebase-functions/v2/https";
import {
  getUserEmail,
  getUserSID,
  userLoggedInAndLabNameExists,
} from "./auth-utilities";
import {getFirestore} from "firebase-admin/firestore";
// import * as logger from "firebase-functions/logger";

// All functions related to creating, requesting access
// and managing access to labs
export const createLab = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

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
    const userEmail = getUserEmail(request);
    await newLabReference.set({
      id: sanLabName,
      name: unSanLabName,
      owner: userSID,
      kitChecklist: [],
      sopName: "",
      users: [{id: userSID, email: userEmail, approved: true}],
    });
  }

  return {sanLabName};
});

// take a lab name and add user to labs users
export const reqToJoinLab = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);
  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const newLabReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await newLabReference.get();

  // if exists merge the new user in
  if (docSnapshot.exists) {
    // create a lab
    const userSID = getUserSID(request);
    const userEmail = getUserEmail(request);
    await newLabReference.set(
      {
        users: [
          ...docSnapshot.get("users"),
          {id: userSID, email: userEmail, approved: false},
        ],
      },
      {merge: true}
    );
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please seek the lab owner"
    );
  }

  return {sanLabName};
});

// take a lab name and user sid and check if field is true
// returns approval field
export const checkIfLabRequestApproved = onCall(async (request) => {
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
    const users: [any] = docSnapshot.get("users");
    const requestingUserSid = getUserSID(request);

    const resultingUser = users.find((user) => user.id === requestingUserSid);

    if (!resultingUser) {
      // user not found in requested lab
      throw new HttpsError(
        "not-found",
        "Sorry this user cannot be found - please contact your lab head"
      );
    } else {
      // user exists so return approval status
      return {approved: resultingUser.approved};
    }
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// for a given lab get all the users
export const getLabUsers = onCall(async (request) => {
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

  // if exists return users
  if (docSnapshot.exists) {
    return {users: docSnapshot.get("users")};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// delete a user for a lab (Reject will also call this)
export const removeUserFromLab = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const sidToDelete = request.data.id;

  if (!(typeof sidToDelete === "string") || sidToDelete.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a user id to delete"
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists find user within users and return approved field
  if (docSnapshot.exists) {
    const users: [any] = docSnapshot.get("users");
    const newUsers = users.filter((user) => user.id !== sidToDelete);

    await labReference.set({users: newUsers}, {merge: true});

    return {success: true};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});

// approves a given user in a lab
export const approveUserInLab = onCall(async (request) => {
  // call prerequistes to check that the request is valid
  // will throw an error otherwise
  const unSanLabName = userLoggedInAndLabNameExists(request);

  const sidToApprove = request.data.id;

  if (!(typeof sidToApprove === "string") || sidToApprove.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "invalid-argument",
      "the function must be passed a user id to approve"
    );
  }

  // safe initialise if needed and get firestore
  const firestore = getFirestore();

  // sanitise lab name and check if doesnt already exist
  const sanLabName = unSanLabName.replace(/\s+/g, "-").toLowerCase();

  const labReference = firestore.collection("labs").doc(sanLabName);

  // attempt get
  const docSnapshot = await labReference.get();

  // if exists find user within users and return approved field
  if (docSnapshot.exists) {
    const users: [any] = docSnapshot.get("users");
    const userToApprove = users.find((user) => user.id === sidToApprove);
    const newApprovedUser = {...userToApprove, ...{approved: true}};
    const newUsers = users
      .filter((user) => user.id !== sidToApprove)
      .concat([newApprovedUser]);

    await labReference.set({users: newUsers}, {merge: true});

    return {success: true};
  } else {
    // if doesnt exist throw an error
    throw new HttpsError(
      "not-found",
      "Sorry this lab name doesn't exist - please request help from developer"
    );
  }
});
