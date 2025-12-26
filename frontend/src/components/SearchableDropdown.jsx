import { useState, useEffect, useRef } from 'react';

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  allOptionLabel, // e.g., "All Customers"
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync search input with external value
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.id === value);
      setSearchTerm(selectedOption ? selectedOption.name : '');
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = optionId => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
        value={searchTerm}
        onFocus={() => setIsOpen(true)}
        onChange={e => {
          setSearchTerm(e.target.value);
          if (e.target.value === '') {
            onChange(''); // Clear selection if input is cleared
          }
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {allOptionLabel && (
            <li
              className="px-4 py-2 text-sm text-slate-300 hover:bg-violet-600 hover:text-white cursor-pointer"
              onClick={() => handleSelect('')}
            >
              {allOptionLabel}
            </li>
          )}
          {filteredOptions.length === 0 && !allOptionLabel && (
            <li className="px-4 py-2 text-sm text-slate-500">No options found.</li>
          )}
          {filteredOptions.map(opt => (
            <li
              key={opt.id}
              className="px-4 py-2 text-sm text-slate-300 hover:bg-violet-600 hover:text-white cursor-pointer"
              onClick={() => handleSelect(opt.id)}
            >
              {opt.renderLabel ? opt.renderLabel() : opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
