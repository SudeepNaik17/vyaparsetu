export const formatDate = (d) =>
  d
    ? new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
