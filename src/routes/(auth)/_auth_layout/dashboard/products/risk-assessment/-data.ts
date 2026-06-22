export type RiskLevelKey = "low" | "medium" | "high" | "prohibited";

export type RiskRange = {
	min: number;
	max: number;
	enabled: boolean;
};

export const RISK_LEVELS = [
	{
		key: "low" as const,
		label: "Low",
		badgeClassName: "bg-teal-100 text-teal-800 border-teal-200",
	},
	{
		key: "medium" as const,
		label: "Medium",
		badgeClassName: "bg-sky-100 text-sky-800 border-sky-200",
	},
	{
		key: "high" as const,
		label: "High",
		badgeClassName: "bg-orange-100 text-orange-800 border-orange-200",
	},
	{
		key: "prohibited" as const,
		label: "Prohibited",
		badgeClassName: "bg-muted text-muted-foreground border-border",
	},
] satisfies Array<{
	key: RiskLevelKey;
	label: string;
	badgeClassName: string;
}>;

export const DEFAULT_RISK_RANGES: Record<RiskLevelKey, RiskRange> = {
	low: { min: 0, max: 40, enabled: true },
	medium: { min: 41, max: 70, enabled: true },
	high: { min: 71, max: 100, enabled: true },
	prohibited: { min: 100, max: 100, enabled: true },
};

export const RISK_ASSESSMENT_CHECKS = [
	{ id: "standard", label: "Standard Risk Check" },
	{ id: "enhanced", label: "Enhanced Compliance Check" },
] as const;

export type RiskAssessmentCheckId =
	(typeof RISK_ASSESSMENT_CHECKS)[number]["id"];
