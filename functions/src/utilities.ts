import {apps, initializeApp} from "firebase-admin";

export function safeInitialiseFirestore() {
  if (apps.length === 0) {
    initializeApp();
  }
}
