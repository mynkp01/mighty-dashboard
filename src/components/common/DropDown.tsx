import { useEffect, useRef, useState } from 'react';

const statusOptions = ['Active', 'Inactive', 'Pending'];

function Dropdown() {
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-left py-2 "
      >
        {selectedStatus}
      </button>

      {open && (
        <ul className="absolute z-10 border bg-white dark:bg-gray-800  rounded-md shadow-lg">
          {statusOptions.map((status) => (
            <li
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
