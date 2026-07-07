import { z } from "zod";

const envSchema = z.object({
	VITE_API_BASE_URL: z.url().default("http://localhost:8300/api"),
	VITE_APP_NAME: z.string().default("Verify Africa"),
	VITE_APP_ENVIRONMENT: z.string().default("development"),
	VITE_SITE_TYPE: z.enum(["public", "client", "admin", "dashboard"]).optional(),
	VITE_ENABLE_ANALYTICS: z.enum(["true", "false"]).optional().default("false"),
	VITE_ENABLE_DEBUG: z.enum(["true", "false"]).optional().default("false"),
	VITE_LANDING_PAGE_VERSION: z.enum(["v1", "v2", "v3"]).optional().default("v1"),
	VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),
	VITE_SENTRY_DSN: z.string().optional(),
	VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	VITE_LOGROCKET_KEY: z.string().optional(),
	VITE_POSTHOG_KEY: z.string().optional(),
	VITE_POSTHOG_HOST: z.string().url().optional().default("https://us.i.posthog.com"),
	VITE_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
	VITE_PUBLIC_SUPABASE_URL: z.string().url().optional(),
	VITE_USE_FIREBASE_STORAGE: z.enum(["true", "false"]).optional().default("false"),
	VITE_FIREBASE_API_KEY: z.string().default(""),
	VITE_FIREBASE_AUTH_DOMAIN: z.string().default(""),
	VITE_FIREBASE_PROJECT_ID: z.string().default(""),
	VITE_FIREBASE_STORAGE_BUCKET: z.string().default(""),
	VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().default(""),
	VITE_FIREBASE_APP_ID: z.string().default(""),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) {
	console.error("[env] Invalid environment configuration:");
	console.error(parsed.error.flatten().fieldErrors);
	throw new Error("Invalid environment configuration");
}

const data = parsed.data;

export const env = {
	...parsed.data,
	// Backward-compatible app config accessors
	apiBaseUrl: data.VITE_API_BASE_URL,
	appName: data.VITE_APP_NAME,
	appEnvironment: data.VITE_APP_ENVIRONMENT,
	siteType: data.VITE_SITE_TYPE,
	enableAnalytics: data.VITE_ENABLE_ANALYTICS === "true",
	enableDebug: data.VITE_ENABLE_DEBUG === "true",
	landingPageVersion: data.VITE_LANDING_PAGE_VERSION,
	googleAnalyticsId: data.VITE_GOOGLE_ANALYTICS_ID,
	sentryDsn: data.VITE_SENTRY_DSN,
	stripePublishableKey: data.VITE_STRIPE_PUBLISHABLE_KEY,
	logRocketKey: data.VITE_LOGROCKET_KEY,
	useFirebaseStorage: data.VITE_USE_FIREBASE_STORAGE === "true",
	firebase: {
		apiKey: data.VITE_FIREBASE_API_KEY,
		authDomain: data.VITE_FIREBASE_AUTH_DOMAIN,
		projectId: data.VITE_FIREBASE_PROJECT_ID,
		storageBucket: data.VITE_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: data.VITE_FIREBASE_MESSAGING_SENDER_ID,
		appId: data.VITE_FIREBASE_APP_ID,
	},
	// Computed runtime values
	isDevelopment: import.meta.env.DEV,
	isProduction: import.meta.env.PROD,
	isPublicSite: data.VITE_SITE_TYPE === "public",
	isDashboardSite: data.VITE_SITE_TYPE === "dashboard",
} as const;

export type Env = z.infer<typeof envSchema>;

if (env.isDevelopment) {
	console.log("[env]", {
		environment: env.appEnvironment,
		siteType: env.siteType ?? "not specified",
		apiBaseUrl: env.apiBaseUrl,
	});
}
