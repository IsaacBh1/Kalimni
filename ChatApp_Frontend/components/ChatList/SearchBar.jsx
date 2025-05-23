import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import "./SearchBar.css";

const SearchBar = ({ placeholder, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(searchValue);
    }
  };

  const handleSearchClick = () => {
    onSearch(searchValue);
  };

  return (
    <div className="search-bar">
      <BiSearch className="search-icon" onClick={handleSearchClick} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchBar;
