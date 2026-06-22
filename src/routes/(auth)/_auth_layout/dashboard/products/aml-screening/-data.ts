export const AML_SCREENING_FILTERS = [
	{ key: "sanction", label: "SANCTION" },
	{ key: "warning", label: "WARNING" },
	{ key: "fitness_probity", label: "FITNESS PROBITY" },
	{ key: "pep", label: "PEP" },
	{ key: "pep_class_1", label: "PEP CLASS 1" },
	{ key: "pep_class_2", label: "PEP CLASS 2" },
	{ key: "pep_class_3", label: "PEP CLASS 3" },
	{ key: "pep_class_4", label: "PEP CLASS 4" },
] as const;

export type AmlScreeningFilterKey =
	(typeof AML_SCREENING_FILTERS)[number]["key"];

export const DEFAULT_AML_SCREENING_FILTERS = Object.fromEntries(
	AML_SCREENING_FILTERS.map((filter) => [filter.key, true]),
) as Record<AmlScreeningFilterKey, boolean>;

export const DEFAULT_MATCH_SCORE = 100;
