import React from "react";

type SpinnerWithXProps = {
  size?: number;
  color?: string;
};

export const SpinnerWithX: React.FC<SpinnerWithXProps> = ({ size = 48, color = "#7769e1" }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="animate-spin" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={"#FFFFFF"}
          strokeWidth={strokeWidth}
          fill={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
          strokeLinecap="round"
        />
      </svg>

      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" className="absolute">
        <line
          x1="4"
          y1="4"
          x2="20"
          y2="20"
          stroke={"#FFFFFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="4"
          x2="4"
          y2="20"
          stroke={"#FFFFFF"}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
