import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: 8,
        borderRadius: 6,
        border: "1px solid gray",
      }}
    />
  );
}
