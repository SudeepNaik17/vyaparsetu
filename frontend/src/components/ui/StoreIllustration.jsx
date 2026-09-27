export default function StoreIllustration() {
  return (
    <svg
      className="store-illustration"
      viewBox="0 0 460 340"
      role="img"
      aria-label="A neighborhood kirana shop with a striped maroon awning"
    >
      <defs>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stopColor="#f6cfc0" />
          <stop offset="1" stopColor="#d79d8b" />
        </linearGradient>
      </defs>
      <g fill="#f6e3da">
        <path d="M0 120 50 92l45 18 22 150H0zM305 95l50-30 42 25 35 182H302z" />
        <path d="m8 67 84-32 83 36-83 15zM321 39l43-17 61 22-9 9z" />
      </g>
      <ellipse cx="226" cy="312" rx="206" ry="20" fill="#ebc9ba" />
      <path d="m99 135 24-73 187 5 29 70" fill="#9d5960" />
      <path
        d="M104 132h218v169H104z"
        fill="url(#wall)"
        stroke="#af7568"
        strokeWidth="2"
      />
      <path d="M121 145h157v149H121z" fill="#744943" />
      <path d="M130 155h60v126h-60zM202 155h64v126h-64z" fill="#492f2c" />
      <g stroke="#bc8b70" strokeWidth="7">
        <path d="M127 190h62m-62 43h62m-62 45h62M203 190h66m-66 43h66m-66 45h66" />
      </g>
      <g fill="#f3d3a5" stroke="#b57256">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <g key={r + "-" + c}>
              <rect
                x={134 + c * 13}
                y={165 + r * 42}
                width="9"
                height="22"
                rx="1"
              />
              <rect
                x={207 + c * 14}
                y={163 + r * 42}
                width="10"
                height="24"
                rx="2"
              />
              <path
                d={"M" + (209 + c * 14) + " " + (161 + r * 42) + "h6v3h-6z"}
                fill="#a54947"
              />
            </g>
          )),
        )}
      </g>
      <path
        d="M98 133 122 69h190l28 64v14H98z"
        fill="#f9dbc6"
        stroke="#b26c66"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={
            "M" +
            (122 + i * 31.5) +
            " 69h16l" +
            (i * 1.5 + 2) +
            " 64v12q-10 16-20 0v-12z"
          }
          fill="#a94750"
        />
      ))}
      <path d="M112 294h216v12H100z" fill="#b87d6a" />
      <path d="M95 306h243v12H84z" fill="#e2b59b" />
      <rect
        x="264"
        y="227"
        width="77"
        height="76"
        rx="3"
        fill="#e1ac92"
        stroke="#a6715c"
      />
      <rect x="255" y="222" width="92" height="11" rx="2" fill="#a86758" />
      <rect x="279" y="243" width="48" height="39" fill="#f9dfc5" />
      <text x="303" y="260" textAnchor="middle" fontSize="11" fill="#9b5350">
        अपना
      </text>
      <text x="303" y="276" textAnchor="middle" fontSize="11" fill="#9b5350">
        व्यापार
      </text>
      <g fill="#e9c3a8" stroke="#ba8970">
        <path d="M63 262q-23 48 3 51h26q24-4 2-51z" />
        <ellipse cx="79" cy="262" rx="17" ry="6" />
        <path d="M36 277q-14 31 1 36h21q14-4 1-36z" />
        <rect x="349" y="271" width="53" height="40" rx="4" />
      </g>
      <g fill="#9d9b7c">
        <path d="M375 271q-36-31-25-45 19-1 25 45M376 270q29-36 40-30-1 23-40 30M375 270q-3-45 7-55 17 11-7 55M375 268q-23-46-10-52 18 10 10 52" />
      </g>
      <path d="M282 197v-46h26v46z" fill="#efd0b4" stroke="#9a5b4b" />
      <text x="295" y="169" fontSize="6" textAnchor="middle" fill="#98594b">
        GENERAL
      </text>
      <text x="295" y="180" fontSize="6" textAnchor="middle" fill="#98594b">
        STORE
      </text>
    </svg>
  );
}
