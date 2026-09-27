export const calculateMargin = (revenue, cost) =>
  revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
