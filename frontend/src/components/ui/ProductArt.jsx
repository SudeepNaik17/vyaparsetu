export default function ProductArt({ kind }) {
  const art = {
    atta: ["#e1ab37", "#ab2232", "आशीर्वाद", "ATTA"],
    oil: ["#f4b834", "#e74f27", "Fortune", "OIL"],
    milk: ["#69c6e7", "#175fac", "Amul", "Taaza"],
    parle: ["#ecc857", "#ac2633", "Parle-G", "Biscuits"],
    maggi: ["#f4d936", "#c82428", "Maggi", "Noodles"],
  }[kind] || ["#ddd0b8", "#971c28", "Stock", "ITEM"];
  return (
    <svg
      role="img"
      aria-label={art[2] + " package illustration"}
      className="product-art"
      viewBox="0 0 38 50"
    >
      <path d="M8 3h22l3 44H5z" fill={art[0]} stroke="#c3a984" />
      <path d="M9 4h20v6H9z" fill={art[1]} />
      <path d="M6 40h26v6H6z" fill={art[1]} />
      <ellipse cx="19" cy="27" rx="10" ry="11" fill="#fff4d7" />
      <text
        x="19"
        y="25"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill={art[1]}
      >
        {art[2]}
      </text>
      <text x="19" y="32" textAnchor="middle" fontSize="4" fill="#533727">
        {art[3]}
      </text>
    </svg>
  );
}
