import {
  checkIfLabRequestApproved,
  createLab,
  getLabUsers,
  reqToJoinLab,
} from "./lab-management";
import * as admin from "firebase-admin";

// initialise firebase
admin.initializeApp();

// functions to upload
export {createLab, reqToJoinLab, checkIfLabRequestApproved, getLabUsers};
