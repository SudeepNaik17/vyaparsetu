export function isReviewable(response) {
  return Boolean(
    response?.draftId &&
    response?.action &&
    response?.args &&
    response?.expiresAt,
  );
}
