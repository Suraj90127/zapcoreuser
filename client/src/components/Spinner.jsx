import React from "react";

const Spinner = ({ color = "#000000" }) => {
  return (
    <div className="bg-white h-[116px] w-[185px] rounded-[20px] mx-auto flex justify-center items-center">
      <svg
        className="animate-spin"
        width="40"
        height="40"
        viewBox="0 0 50 50"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}       // 👈 SPINNER COLOR
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        />
      </svg>
    </div>
  );
};

export default Spinner;
