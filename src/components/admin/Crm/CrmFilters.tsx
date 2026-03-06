import { SxProps } from '@mui/material';
import { Calendar, CalendarDays, Filter } from 'lucide-react';
import moment from 'moment';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setUserForCrm } from '../../../redux/slices/userForCrmSlice';
import { ROLE } from '../../../utils/Constant';
import { isEmpty } from '../../../utils/helper';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

export type FilterType = 'monthly' | 'yearly' | 'custom';

interface CrmFiltersProps {
  payload: any;
  setPayload: Dispatch<SetStateAction<any>>;
  isLoading?: boolean;
  hideCrmTypeFilters?: boolean;
  hideUserFilters?: boolean;
  hideDateFilters?: boolean;
}

const CrmFilters = ({
  payload,
  setPayload,
  isLoading,
  hideCrmTypeFilters = false,
  hideUserFilters = false,
  hideDateFilters = false,
}: CrmFiltersProps) => {
  const dispatch = useAppDispatch();

  const userData: any = useAppSelector((state) => state.user);
  const crmUserData: any = useAppSelector(
    (state) => state.userForCrm?.userForCrm,
  );

  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleFilterChange = (type: FilterType) => {
    let startDate = '';
    let endDate = '';

    switch (type) {
      case 'monthly':
        startDate = moment().subtract(1, 'month').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
        break;
      case 'yearly':
        startDate = moment().subtract(1, 'year').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
        break;
      default:
        startDate = '';
        endDate = '';
        break;
    }

    setPayload((prevData: any) => ({ ...prevData, type, startDate, endDate }));
    setShowCustomPicker(type === 'custom');
  };

  const FilterButton = ({
    type,
    label,
    icon,
  }: {
    type: FilterType;
    label: string;
    icon: React.ReactNode;
  }) => (
    <AnimatedButton
      variant={payload.type === type ? 'primary' : 'secondary'}
      size="sm"
      onClick={() => handleFilterChange(type)}
      disabled={isLoading}
      className="flex items-center h-[44.13px] w-full gap-2 px-2 xsm:px-3"
      showTooltip={label}
    >
      {icon}
      <p className="text-xs xsm:text-sm truncate">{label}</p>
    </AnimatedButton>
  );

  const handleCustomDateChange = (dates: Date[]) => {
    if (dates.length === 2) {
      setPayload({
        ...payload,
        startDate: moment(dates[0]).format('YYYY-MM-DD'),
        endDate: moment(dates[1]).format('YYYY-MM-DD'),
      });
    }
  };

  const handleFetchDropdownChange = useCallback((name: string, value: any) => {
    setPayload((prev: any) => ({
      ...prev,
      [name]: value?.map((i: any) => i?._id) || [],
    }));
    if (name === 'crm_type') {
      setPayload((prev: any) => ({
        ...prev,
        crm_sub_type: [],
      }));
    }
    if (name === 'country') {
      setPayload((prev: any) => ({
        ...prev,
        city: [],
      }));
    }
  }, []);

  const filters = [];

  if (!hideUserFilters) {
    filters.push(
      <Select
        endPoints={apiHandler.userHandler.lookup}
        filterStr={`user_type=${ROLE.ADMIN},${ROLE.BDE}`}
        placeholder="Select User"
        value={crmUserData}
        display="full_name"
        func={(_label, value) =>
          dispatch(setUserForCrm(value?.map((i: any) => i?._id)))
        }
        textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
        disableClearable={false}
        isDisabled={isLoading}
        multiple
        defaultValueKey="_id"
        defaultValueIndex={
          crmUserData === undefined ? [userData?._id] : undefined
        }
      />,
    );
  }

  if (!hideCrmTypeFilters) {
    filters.push(
      <Select
        endPoints={apiHandler.lookupValueHandler.lookupValue}
        filterStr={`value_code=CRM_TYPE`}
        placeholder="Select CRM Type"
        value={payload.crm_type}
        multiple
        disableClearable={false}
        isDisabled={isLoading}
        objKey="crm_type"
        display="name"
        func={handleFetchDropdownChange}
        textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
      />,
      <Select
        key={`crm_sub_type_${payload.crm_type?.toString()}`}
        endPoints={apiHandler.lookupValueHandler.lookupValue}
        filterStr={`parent_category_id=${payload.crm_type?.toString()}`}
        placeholder="Select CRM Sub Type"
        value={payload.crm_sub_type}
        multiple
        disableClearable={false}
        isDisabled={isEmpty(payload.crm_type) || isLoading}
        objKey="crm_sub_type"
        display="name"
        func={handleFetchDropdownChange}
        textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
      />,
    );
  }

  filters.push(
    <Select
      endPoints={apiHandler.lookupValueHandler.lookupValue}
      filterStr={`value_code=VERTICAL`}
      placeholder="Select Vertical"
      value={payload.vertical}
      multiple
      disableClearable={false}
      isDisabled={isLoading}
      objKey="vertical"
      display="name"
      func={handleFetchDropdownChange}
      textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
    />,
    <Select
      endPoints={apiHandler.countryHandler.lookup}
      filterStr={`value_code=`}
      placeholder="Select Country"
      value={payload.country}
      multiple
      disableClearable={false}
      isDisabled={isLoading}
      objKey="country"
      display="name"
      func={handleFetchDropdownChange}
      textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
    />,
    <Select
      key={`city_${payload.country?.toString()}`}
      endPoints={apiHandler.CityHandler.lookup}
      filterStr={`country_id=${payload.country?.toString()}`}
      placeholder="Select City"
      value={payload.city}
      multiple
      disableClearable={false}
      isDisabled={isEmpty(payload?.country) || isLoading}
      objKey="city"
      display="name"
      func={handleFetchDropdownChange}
      textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
    />,
  );

  if (!hideDateFilters) {
    filters.push(
      <div className="flex gap-2 h-full">
        <FilterButton
          type="monthly"
          label="Monthly"
          icon={<Calendar className="min-h-3 min-w-3 xsm:size-4" />}
        />
        <FilterButton
          type="yearly"
          label="Yearly"
          icon={<CalendarDays className="min-h-3 min-w-3 xsm:size-4" />}
        />
        <FilterButton
          type="custom"
          label="Custom"
          icon={<Filter className="min-h-3 min-w-3 xsm:size-4" />}
        />
      </div>,
    );

    if (showCustomPicker) {
      filters.push(
        <div className="size-full">
          <Flatpickr
            options={{
              mode: 'range',
              dateFormat: 'd/m/Y',
              maxDate: new Date(),
            }}
            style={{ height: '100%' }}
            value={
              payload.type === 'custom'
                ? undefined
                : [
                    new Date(payload.startDate || ''),
                    new Date(payload.endDate || ''),
                  ]
            }
            onChange={handleCustomDateChange}
            disabled={isLoading}
            className="size-full rounded-lg bg-transparent border border-gray-300 px-3 text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed py-3"
            placeholder="Select date range"
          />
        </div>,
      );
    }
  }

  return filters;
};

const SelectSx: SxProps = {
  '& .MuiChip-root': {
    px: '6px !important',
    py: '2px !important',
    height: 'auto !important',
    margin: '0px !important',
    gap: '3px !important',
    maxWidth: '100% !important',
  },
  '& .MuiChip-label': {
    px: '0px !important',
  },
  '& .MuiChip-deleteIcon': {
    height: '16px !important',
    width: '16px !important',
    margin: '0px !important',
  },
};

export default CrmFilters;
