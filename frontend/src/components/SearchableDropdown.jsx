import { useState, useEffect, useRef } from "react";

const SearchableDropdown = ({ options, value, onChange, placeholder, labelKey = "label", valueKey = "value", disabled = false, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const label = typeof option === "object" ? option[labelKey] : option;
    return String(label).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = options.find((opt) => (typeof opt === "object" ? opt[valueKey] : opt) == value);
    if (!selectedOption) return placeholder;
    return typeof selectedOption === "object" ? selectedOption[labelKey] : selectedOption;
  };

  if (disabled) {
    return <div className="w-full border p-2 rounded bg-gray-100 text-gray-400 h-10.5 flex items-center">{placeholder}</div>;
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className={`border p-2 rounded bg-white cursor-pointer flex justify-between items-center h-10.5 ${required && !value ? "border-red-300" : "border-gray-300"}`} onClick={() => setIsOpen(!isOpen)}>
        <span className={`block truncate ${!value ? "text-gray-500" : "text-gray-900"}`}>{getDisplayValue()}</span>
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              className="w-full border p-1 rounded text-sm focus:outline-none focus:border-[#1B4D3E]"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div
            className="p-2 hover:bg-gray-50 cursor-pointer text-gray-500 italic text-sm border-b"
            onClick={() => {
              onChange("");
              setIsOpen(false);
              setSearchTerm("");
            }}
          >
            Clear Selection
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const optValue = typeof option === "object" ? option[valueKey] : option;
              const optLabel = typeof option === "object" ? option[labelKey] : option;
              return (
                <div
                  key={index}
                  className={`p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer text-sm ${value == optValue ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {optLabel}
                </div>
              );
            })
          ) : (
            <div className="p-2 text-gray-500 text-sm text-center">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
