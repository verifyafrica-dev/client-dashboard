import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

import { env } from "#/config/env";

function getOrInitFirebaseApp() {
	if (getApps().length > 0) {
		return getApp();
	}

	return initializeApp({
		apiKey: env.firebase.apiKey,
		authDomain: env.firebase.authDomain,
		projectId: env.firebase.projectId,
		storageBucket: env.firebase.storageBucket,
		messagingSenderId: env.firebase.messagingSenderId,
		appId: env.firebase.appId,
	});
}

export function isFirebaseConfigured() {
	const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } =
		env.firebase;

	return Boolean(
		apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId,
	);
}

export function getFirebaseStorage() {
	if (!isFirebaseConfigured()) {
		throw new Error(
			"Firebase is not configured. Set VITE_FIREBASE_* environment variables.",
		);
	}

	return getStorage(getOrInitFirebaseApp());
}
