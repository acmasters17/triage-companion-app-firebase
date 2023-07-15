// functions that checks the user is authenticated
// and other functions related to auth
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";

export function isUserLoggedIn(request: CallableRequest<any>) {
  return request.auth;
}
// returns lab name
export function userLoggedInAndLabNameExists(request: CallableRequest<any>) {
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

  return unSanLabName;
}

// assums isUserLoggedIn alredy called
export function getUserSID(request: CallableRequest<any>) {
  return request.auth!.uid;
}

// assums isUserLoggedIn alredy called
export function getUserEmail(request: CallableRequest<any>) {
  return request.auth!.token.email ? request.auth!.token.email : "";
}
