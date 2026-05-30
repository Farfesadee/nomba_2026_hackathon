"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+1", flag: "🇺🇸", name: "USA/Canada" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function PhoneInput({ value, onChange, placeholder = "Phone number", required, className = "" }: Props) {
  const [selected, setSelected] = useState(COUNTRIES[0]);

  const displayValue = value.startsWith(selected.code) ? value.slice(selected.code.length) : value;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, "");
    onChange(`${selected.code}${num}`);
  };

  return (
    <div className={`flex rounded-lg border border-input bg-background overflow-hidden ${className}`}>
      <select
        value={selected.code}
        onChange={(e) => {
          const country = COUNTRIES.find((c) => c.code === e.target.value) || COUNTRIES[0];
          setSelected(country);
          const num = value.replace(selected.code, "");
          onChange(`${country.code}${num}`);
        }}
        className="flex-shrink-0 border-r border-input bg-background px-2 py-2 text-sm outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={displayValue}
        onChange={handleNumberChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none min-w-0"
      />
    </div>
  );
}
