import {
  checkIfLabRequestApproved,
  createLab,
  getLabUsers,
  reqToJoinLab,
  approveUserInLab,
  removeUserFromLab,
} from "./lab-management";
import * as admin from "firebase-admin";
import {updateUploadedSOPName, getUploadedSOPName} from "./sop-management";

// initialise firebase
admin.initializeApp();

// functions to upload
export {
  createLab,
  reqToJoinLab,
  checkIfLabRequestApproved,
  getLabUsers,
  approveUserInLab,
  removeUserFromLab,
  updateUploadedSOPName,
  getUploadedSOPName,
};
