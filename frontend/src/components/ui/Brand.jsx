import Icon from "./Icon";
export default function Brand({ large = false }) {
  return (
    <div className={"brand " + (large ? "brand-large" : "")}>
      <span className="brand-mark">
        <Icon name="Store" size={large ? 35 : 23} />
      </span>
      <span>
        <strong>VyaparSetu</strong>
        <small>Bol ke business chalao.</small>
      </span>
    </div>
  );
}
