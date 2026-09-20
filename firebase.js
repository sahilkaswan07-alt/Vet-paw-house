// js/firebase.js
// Saves the registration (with the chosen plan) and its pending UPI payment
// to Firestore, including the pet photo.
//
// NOTE: Firebase Storage now requires the paid Blaze plan (a Google policy
// change effective Feb 2026) — it can no longer be used on the free Spark
// plan at all, even within the free quota. So instead of uploading the
// photo to Storage, we compress it in the browser and store it directly
// as a field inside the Firestore document. Firestore itself stays fully
// free on Spark. Firestore's per-document limit is 1 MiB, so the photo is
// resized/compressed client-side to comfortably fit well under that.
//
// Two collections are written together in one atomic batch:
//   registrations/{id}  -> owner + pet details + photo + plan + planStatus
//   payments/{id}       -> light payment record the admin page reviews
//                          (same id as the registration, no photo, so the
//                          admin list stays fast)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkNU-b_ItnJhWTDNxwewuRG_DLBCGuCDk",
  authDomain: "paw-house-7acb6.firebaseapp.com",
  projectId: "paw-house-7acb6",
  storageBucket: "paw-house-7acb6.firebasestorage.app",
  messagingSenderId: "461862762380",
  appId: "1:461862762380:web:3a51d5410857d5966a48a9"
};

// Exported so admin-payments.html can reuse the same Firebase app.
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Resizes + re-encodes a base64 image data URL down to a small JPEG,
// so it comfortably fits inside a Firestore document (1 MiB limit).
function compressImage(dataUrl, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round(height * (maxDim / width));
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round(width * (maxDim / height));
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Compresses the pet photo, then saves the registration and its pending
 * payment in a single batch (both succeed or neither does).
 *
 * payment = { planId, planName, planAmount, amount, utr }
 *
 * Returns { id, photoURL } on success — photoURL here is the compressed
 * base64 JPEG data itself (not a hosted link) — or null on failure.
 */
window.saveUserToFirebase = async function (formData, petPhotoDataUrl, payment) {
  try {
    let photoData = "";

    if (petPhotoDataUrl) {
      // First pass: reasonable size/quality.
      photoData = await compressImage(petPhotoDataUrl, 800, 0.6);
      // Firestore hard limit is 1 MiB per document; stay well under it.
      if (photoData.length > 700000) {
        photoData = await compressImage(petPhotoDataUrl, 500, 0.45);
      }
    }

    const regRef = doc(collection(db, "registrations"));   // auto id
    const payRef = doc(db, "payments", regRef.id);          // same id
    const batch = writeBatch(db);

    batch.set(regRef, {
      ownerName: formData.ownerName || "",
      ownerContact: formData.ownerContact || "",
      ownerEmail: formData.ownerEmail || "",
      petName: formData.petName || "",
      petBreed: formData.petBreed || "",
      petSex: formData.petSex || "",
      petAge: formData.petAgeDisplay || "",
      petPhoto: photoData,
      plan: payment.planId,
      planName: payment.planName,
      planAmount: payment.planAmount,
      planStatus: "pending",          // pending -> active | rejected (set by admin page)
      createdAt: serverTimestamp()
    });

    batch.set(payRef, {
      registrationId: regRef.id,
      ownerName: formData.ownerName || "",
      ownerEmail: formData.ownerEmail || "",
      ownerContact: formData.ownerContact || "",
      petName: formData.petName || "",
      planId: payment.planId,
      planName: payment.planName,
      planAmount: payment.planAmount,
      amount: payment.amount,          // what the owner says they paid
      utr: payment.utr,
      status: "pending",               // pending -> approved | rejected
      createdAt: serverTimestamp()
    });

    await batch.commit();

    return { id: regRef.id, photoURL: photoData };
  } catch (err) {
    console.error("saveUserToFirebase error:", err);
    return null;
  }
};