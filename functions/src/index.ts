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
import {
  updateKitChecklist,
  getKitChecklist,
} from "./kit-checklist-management";
import {updateFlashCards, getFlashCards} from "./flashcard-management";
import {
  getTTChecklist,
  updateTTChecklist,
} from "./ttc-management";

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
  updateKitChecklist,
  getKitChecklist,
  updateFlashCards,
  getFlashCards,
  updateTTChecklist,
  getTTChecklist,
};
