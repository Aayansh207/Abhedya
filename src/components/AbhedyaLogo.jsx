import React from "react";

export default function AbhedyaLogo({ size = 32, className = "", glowing = true }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      {glowing && (
        <div
          className="absolute inset-0 rounded-lg blur-md bg-gradient-to-br from-[#ff3b30]/40 via-[#ff3b30]/25 to-black/60 group-hover:from-[#ff3b30]/70 group-hover:to-[#ff3b30]/50 transition-all duration-300 pointer-events-none"
        />
      )}

      {/* SVG Pixelated & Cybernetic Shield */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 group-hover:scale-105"
      >
        {/* Pixel-Stepped Outer Shield Outline */}
        <path
          d="M24 2L42 10V22C42 33 34 42 24 46C14 42 6 33 6 22V10L24 2Z"
          fill="#141414"
          stroke="#ff3b30"
          strokeWidth="2.5"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />

        {/* Inner Pixel Grid Lattice */}
        <path
          d="M24 7L37 13V22C37 30.5 30.5 37.5 24 41C17.5 37.5 11 30.5 11 22V13L24 7Z"
          fill="#0d0d0d"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.8"
        />

        {/* Central Hexagonal Core */}
        <polygon
          points="24,14 31,18 31,26 24,30 17,26 17,18"
          fill="#1a1a1a"
          stroke="#ff3b30"
          strokeWidth="1.8"
        />

        {/* Glowing Center Core Bit */}
        <rect
          x="22"
          y="20"
          width="4"
          height="4"
          fill="#ffffff"
          className="animate-pulse"
        />

        {/* 4 Cardinal Pixel Accent Marks */}
        <rect x="22" y="9" width="4" height="2" fill="#ff3b30" />
        <rect x="22" y="35" width="4" height="2" fill="#ff3b30" />
        <rect x="13" y="21" width="2" height="4" fill="#ffffff" />
        <rect x="33" y="21" width="2" height="4" fill="#ffffff" />
      </svg>
    </div>
  );
}
