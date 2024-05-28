import React, { useState, useEffect, useRef } from "react";

const CustomSearch = ({ options, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    filterOptions();
  }, [searchTerm, options]);

  const filterOptions = () => {
    if (!searchTerm) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsOpen(true);
  };

  const handleSelectChange = (option) => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div style={style} ref={inputRef}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              border: "1px solid #ccc",
              zIndex: 999,
              backgroundColor: "#fff",
            }}
          >
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelectChange(option)}
                style={{ padding: "8px", cursor: "pointer" }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSearch;
