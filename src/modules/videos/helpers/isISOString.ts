const isISOString = (iso: string) => {
	const d = new Date(iso);
	return !Number.isNaN(d.valueOf()) && d.toISOString() === iso;
};

export { isISOString };
