import { Suspense } from "react";
import RecordsScreen from "./RecordsScreen";
export default function Screen() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <RecordsScreen kind="udhaar" />
    </Suspense>
  );
}
