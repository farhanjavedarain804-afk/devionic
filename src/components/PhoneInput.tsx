import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const countryCodes = [
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+974", country: "QA", flag: "🇶🇦" },
  { code: "+968", country: "OM", flag: "🇴🇲" },
  { code: "+973", country: "BH", flag: "🇧🇭" },
  { code: "+965", country: "KW", flag: "🇰🇼" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+90", country: "TR", flag: "🇹🇷" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+880", country: "BD", flag: "🇧🇩" },
  { code: "+94", country: "LK", flag: "🇱🇰" },
  { code: "+93", country: "AF", flag: "🇦🇫" },
  { code: "+98", country: "IR", flag: "🇮🇷" },
  { code: "+964", country: "IQ", flag: "🇮🇶" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullValue: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  defaultPrefix?: string;
}

const PhoneInput = ({ value, onChange, placeholder = "XXX-XXXXXXX", maxLength = 20, required, defaultPrefix = "+92" }: PhoneInputProps) => {
  // Parse existing value to extract prefix
  const getInitialPrefix = () => {
    if (!value) return defaultPrefix;
    const match = countryCodes.find(c => value.startsWith(c.code));
    return match ? match.code : defaultPrefix;
  };

  const getInitialNumber = () => {
    if (!value) return "";
    const match = countryCodes.find(c => value.startsWith(c.code));
    if (match) return value.slice(match.code.length).replace(/^-/, "");
    return value;
  };

  const [prefix, setPrefix] = useState(getInitialPrefix);
  const [number, setNumber] = useState(getInitialNumber);

  const handlePrefixChange = (newPrefix: string) => {
    setPrefix(newPrefix);
    if (number) onChange(`${newPrefix}-${number}`);
  };

  const handleNumberChange = (newNumber: string) => {
    // Only allow digits and hyphens
    const cleaned = newNumber.replace(/[^0-9-]/g, "");
    setNumber(cleaned);
    if (cleaned) onChange(`${prefix}-${cleaned}`);
    else onChange("");
  };

  return (
    <div className="flex gap-1.5">
      <Select value={prefix} onValueChange={handlePrefixChange}>
        <SelectTrigger className="w-[100px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[250px]">
          {countryCodes.map(c => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-1.5 text-xs">
                <span>{c.flag}</span>
                <span>{c.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={number}
        onChange={e => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="flex-1"
      />
    </div>
  );
};

export default PhoneInput;
