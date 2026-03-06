import { ChevronDown, Filter, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import { isEmpty } from '../../../utils/helper';
import Button from '../../ui/button/Button';
import CrmFilters from './CrmFilters';

const CrmSearchBox = ({
  payload,
  setPayload,
  onClick,
  permission,
  currentRole,
  className = '',
  add = true,
  showActionButtons = true,
  left,
  showResetFilterButton = false,
  handleResetFilters,
  handleImportToExcel,
  isLoading,
  hideCrmTypeFilters = false,
  hideUserFilters = false,
  hideDateFilters = false,
  ignoreFiltersKeyFromCount = [],
  placeholder = 'Search...',
}: any) => {
  const showAddButton = permission?.includes(currentRole);
  const ignoredKeys = [
    'page',
    'limit',
    'sort',
    'sort_field',
    'startDate',
    'endDate',
  ];

  const crmUserData: any = useAppSelector(
    (state) => state.userForCrm?.userForCrm,
  );

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Get CRM filters
  const filterArr = CrmFilters({
    payload,
    setPayload,
    isLoading,
    hideCrmTypeFilters,
    hideUserFilters,
    hideDateFilters,
  });

  // Calculate active filter count (ignoring sorting and date keys for CRM)
  const getFilterCount = () => {
    if (!isEmpty(ignoreFiltersKeyFromCount)) {
      ignoredKeys.push(...ignoreFiltersKeyFromCount);
    }

    return Object.entries({
      ...payload,
      ...(!isEmpty(crmUserData) && { user_id: crmUserData }),
    }).filter(([key, value]) => {
      if (ignoredKeys.includes(key)) return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const filterCount = getFilterCount();

  return (
    <div className={`m-4 ${className}`}>
      {/* Main Header Row */}
      <div className="flex flex-wrap flex-col sm:flex-row gap-4 sm:items-center">
        {/* Left Side - Show entries */}
        {left && React.isValidElement(left) ? (
          left
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Show</span>
            <div className="relative z-10">
              <select
                className="min-w-16 appearance-none h-9 py-2 pl-3 pr-7.5 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg shadow-theme-xs placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-primary-800"
                onChange={(e) =>
                  setPayload((prev: any) => ({
                    ...prev,
                    limit: parseInt(e.target.value),
                    page: 1,
                  }))
                }
              >
                <option value="10" className="text-gray-700 dark:text-gray-300">
                  10
                </option>
                <option value="25" className="text-gray-700 dark:text-gray-300">
                  25
                </option>
                <option value="50" className="text-gray-700 dark:text-gray-300">
                  50
                </option>
                <option
                  value="100"
                  className="text-gray-700 dark:text-gray-300"
                >
                  100
                </option>
              </select>
            </div>
            <span className="text-gray-500 dark:text-gray-400">entries</span>
          </div>
        )}

        {/* Right Side - Controls */}
        <div className="flex md:w-auto w-full flex-col md:ml-auto sm:flex-row gap-3 sm:items-center">
          {/* Filter Button */}
          {filterArr.length > 0 && (
            <div className="flex gap-2 items-center">
              {showResetFilterButton ? (
                <Button
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  variant="outline"
                  name={
                    <>
                      <RotateCcw className="size-4" />
                      Reset
                    </>
                  }
                  size="xs"
                />
              ) : null}

              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 w-full sm:w-auto"
                variant="outline"
                name={
                  <p className="whitespace-nowrap flex items-center gap-2">
                    <Filter className="size-4" />
                    Filters ({filterCount})
                    <ChevronDown
                      className={`size-4 transition-transform duration-200 ${
                        isFilterOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </p>
                }
                size="xs"
              />
            </div>
          )}

          {/* Search and Action Buttons */}
          <div className="flex flex-col w-full sm:flex-row gap-2 sm:items-center">
            {/* Search Input */}
            <div className="relative w-full">
              <div className="absolute -translate-y-1/2 left-3 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </div>
              <input
                onChange={(e) =>
                  setPayload((prev: any) => {
                    return { ...prev, search: e.target.value, page: 1 };
                  })
                }
                value={payload?.search}
                type="text"
                placeholder={placeholder}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-1.5 pl-10 pr-1.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border focus:outline-none focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border lg:w-[200px]"
              />
            </div>

            {/* Action Buttons */}
            {showActionButtons ? (
              <>
                {/* <Button
                  className="flex-1 sm:flex-none"
                  name="Clear"
                  size="xs"
                  onClick={() => {
                    const newPayload: any = {};
                    setPayload((prev: any) => {
                      Object.keys(prev).forEach((key) => {
                        newPayload[key] = ignoredKeys.includes(key)
                          ? prev[key]
                          : Array.isArray(prev[key])
                          ? []
                          : '';
                      });
                      return {
                        ...newPayload,
                        page: 1,
                        limit: 10,
                        sort: 'desc',
                        sort_field: 'updatedAt',
                      };
                    });
                  }}
                /> */}
                {showAddButton && add && (
                  <Button
                    className="flex-1 sm:flex-none"
                    name="Add"
                    size="xs"
                    onClick={onClick}
                  />
                )}
                {handleImportToExcel && (
                  <Button
                    onClick={() => handleImportToExcel()}
                    className="text-nowrap flex-1 sm:flex-none"
                    name="Import Excel"
                    size="xs"
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter Menu with Slide Animation */}
      {filterArr.length > 0 && (
        <div
          className={`transition-all duration-300 ease-in-out ${
            isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
              {filterArr?.map((element: React.ReactNode, index: number) => (
                <div
                  key={index}
                  className="animate-in slide-in-from-top-2 duration-300"
                >
                  {element}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmSearchBox;
