export const reportsLinks = {
	list: "/dashboard/reports/" as const,
	detail: (id: string) => `/dashboard/reports/${id}` as const,
	batchDetail: (batchId: string) => `/dashboard/reports/batch/${batchId}` as const,
};
