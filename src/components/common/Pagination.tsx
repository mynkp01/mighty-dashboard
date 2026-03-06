import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface PaginationProps {
  totalEntries?: number;
  entriesPerPage?: number;
  setPayload: Dispatch<SetStateAction<any>>;
  totalPages?: number;
  page?: number;
}

function Pagination({
  totalEntries = 0,
  entriesPerPage = 5,
  setPayload,
  totalPages,
  page = 1,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(page);

  const calculatedTotalPages = Math.ceil(totalEntries / entriesPerPage);

  const actualTotalPages =
    calculatedTotalPages > 0 ? calculatedTotalPages : totalPages || 0;

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    if (currentPage > actualTotalPages && actualTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalEntries, entriesPerPage, actualTotalPages, currentPage]);

  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);



  let pagesToShow = [];
  if (actualTotalPages <= 3) {
    pagesToShow = [...Array(actualTotalPages)].map((_, i) => i + 1);
  } else if (currentPage === 1) {
    pagesToShow = [1, 2, 3];
  } else if (currentPage === actualTotalPages) {
    pagesToShow = [
      actualTotalPages - 2,
      actualTotalPages - 1,
      actualTotalPages,
    ];
  } else {
    pagesToShow = [currentPage - 1, currentPage, currentPage + 1];
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPayload((prev: any) => ({ ...prev, page: newPage }));
    }
  };

  const handleNext = () => {
    if (currentPage < actualTotalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPayload((prev: any) => ({ ...prev, page: newPage }));
    }
  };

  if (!totalEntries || actualTotalPages === 0) {
    return null;
  }

  return (
    <div className="sm:flex flex-row grid gap-3 sm:items-center sm:justify-between p-4">
      <p className="text-sm font-medium sm:text-center text-gray-500 xl:text-left">
        Showing {startEntry} to {endEntry} of {totalEntries} entries
      </p>

      <div className="flex items-center sm:justify-center">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {pagesToShow.map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                setPayload((prev: any) => ({ ...prev, page }));
              }}
              className={`px-4 py-2 flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium 
                ${
                  currentPage === page
                    ? 'bg-primary-500 text-white dark:text-white'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-primary-500 dark:hover:text-primary-500'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === actualTotalPages}
          className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
