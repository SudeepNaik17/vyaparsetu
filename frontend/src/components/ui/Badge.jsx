export default function Badge({ children, tone = "warm" }) {
  return <span className={"badge " + tone}>{children}</span>;
}
