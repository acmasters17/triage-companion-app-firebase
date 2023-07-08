// functions that checks the user is authenticated
// and other functions related to auth
import {CallableRequest} from "firebase-functions/v2/https";

export function isUserLoggedIn(request: CallableRequest<any>) {
  return request.auth;
}

// assums isUserLoggedIn alredy called
export function getUserSID(request: CallableRequest<any>) {
  return request.auth!.uid;
}
