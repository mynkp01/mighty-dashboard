import {
  Autocomplete,
  AutocompleteRenderInputParams,
  SxProps,
  TextField,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { isEmpty } from '../../utils/helper';

interface SelectProps {
  value?: any;
  endPoints?: (query: string) => Promise<any>;
  filterStr?: string;
  func: (label: string, value: any, index: number) => void;
  objKey?: string;
  idKey?: string;
  display?: string;
  data?: any[];
  required?: true | false;
  multiple?: true | false;
  className?: string;
  isComponentDisabled?: true | false;
  textMenuSx?: (customStyles: SxProps) => SxProps;
  disabledOptions?: any;
  index?: any;
  disableClearable?: boolean;
  disablePortal?: boolean;
  defaultValueIndex?: number | any[];
  defaultValueKey?: string;
  placeholder?: string;
  errorOutline?: string;
  filterSelectedOptions?: boolean;
  isDisabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  endPoints,
  filterStr,
  func,
  objKey,
  index,
  idKey = '_id',
  display,
  data,
  disabledOptions = [],
  multiple = false,
  className,
  placeholder,
  textMenuSx = () => {},
  defaultValueIndex,
  defaultValueKey,
  disableClearable = true,
  disablePortal = true,
  filterSelectedOptions,
  isDisabled = false,
}) => {
  const [defaultProps, setDefaultProps] = useState<{
    options: any[];
    getOptionLabel: (option: any) => string;
  }>({ options: [], getOptionLabel: () => '' });
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!isEmpty(defaultValueIndex) && isEmpty(value)) {
      let defaultOption;
      if (Array.isArray(defaultValueIndex)) {
        defaultOption = [];

        for (let i = 0; i < defaultValueIndex.length; i++) {
          const element = defaultValueIndex[i];
          const findValue = defaultProps.options.find(
            (v) => v[`${defaultValueKey}`] == element,
          );
          if (findValue) {
            if (multiple) {
              defaultOption.push(findValue);
            } else {
              defaultOption = findValue;
            }
          }
        }
      } else {
        defaultOption = defaultProps.options[defaultValueIndex!];
      }

      if (!isEmpty(defaultOption)) {
        func(objKey!, defaultOption, index);
      }
    }
  }, [
    defaultProps.options?.length,
    Array.isArray(defaultValueIndex)
      ? defaultValueIndex?.length
      : defaultValueIndex,
    defaultValueKey,
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res: any = await endPoints!(filterStr || '');
        if (
          (res.status === 200 || res.status === 201) &&
          res.data.data &&
          Array.isArray(res.data.data)
        ) {
          setDefaultProps({
            options: res?.data?.data,
            getOptionLabel: (option) => {
              const displayArr = display!.split(',');
              const arr = displayArr.map((v, i) => {
                let obj = { ...option };
                const keyArr = v.split('.');
                keyArr.forEach((v) => (obj = obj[v]));
                if (i + 1 === displayArr.length && displayArr.length !== 1) {
                  return ` (${obj})`;
                } else {
                  return `${obj}`;
                }
              });
              return arr.join('');
            },
          });
          setOptions(res.data.data);
        }
      } catch (error: any) {
        console.log(error?.response?.data?.message || error.message);
      }
    }

    if (endPoints! && filterStr) {
      if (defaultProps?.options?.length === 0 || !value) fetchData();
    } else if (!isEmpty(data)) {
      setDefaultProps({
        options: data as any,
        getOptionLabel: (option) => {
          const displayArr = display!.split(',');
          const arr = displayArr.map((v, i) => {
            let obj = { ...option };
            const keyArr = v.split('.');
            keyArr.forEach((v) => (obj = obj[v]));
            if (i + 1 === displayArr.length && displayArr.length !== 1) {
              return ` (${obj})`;
            } else {
              return `${obj}`;
            }
          });
          return arr.join('');
        },
      });
      setOptions(data as any);
    } else {
      setDefaultProps({ options: [], getOptionLabel: () => '' });
    }
  }, [filterStr, data]);

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        variant="standard"
        sx={Object.assign(customStyles!, textMenuSx(customStyles))}
        placeholder={
          multiple && Array.isArray(value) && value.length > 0
            ? ''
            : placeholder
        }
      />
    ),
    [value?.length],
  );

  return (
    <>
      {!isEmpty(defaultProps) ? (
        <Autocomplete
          {...defaultProps}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          getOptionKey={(options) => options[idKey]}
          filterSelectedOptions={filterSelectedOptions}
          multiple={multiple || false}
          className={className}
          disablePortal={disablePortal}
          disableClearable={disableClearable}
          id={filterStr || index}
          onChange={(_e, newValue) => func(objKey!, newValue, index)}
          value={
            multiple
              ? value &&
                Array.isArray(value) &&
                value.length > 0 &&
                defaultProps.options.length > 0 &&
                options.length > 0
                ? options.filter(
                    (v: any) =>
                      v?.[idKey]?.toString() ===
                      value.find(
                        (n) => n.toString() === v?.[idKey]?.toString(),
                      ),
                  )
                : []
              : value && defaultProps.options.length > 0
              ? defaultProps.options.find(
                  (v) => v?.[idKey]?.toString() === value.toString(),
                )
              : null
          }
          disabled={isDisabled}
          getOptionDisabled={(option) => {
            const arr = disabledOptions.filter(
              (v: any) => option?.[idKey]?.toString() === v.toString(),
            );
            return arr.length > 0;
          }}
          renderInput={renderInput}
        />
      ) : null}
    </>
  );
};

Select.displayName = 'Select';

export default React.memo(Select);

const customStyles: SxProps = {
  fontSize: '14px !important',
  fontWeight: '500 !important',
  '& .MuiAutocomplete-inputFocused': {
    boxShadow: 'none !important',
  },
  '& .MuiInputBase-root': {
    width: '100%',
    padding: '7px 16px !important',
    borderRadius: '8px',
    fontSize: '14px !important',
    gap: '4px',
    color: '#1A1D1F !important',
    border: '1px solid #d0d5dd',
    boxShadow: ' 0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    fontFamily: 'inherit !important',
    '&::before, &::after, &:hover::before, &:hover::after': {
      borderBottom: 'none !important',
    },
    '& input': {
      '&::placeholder': {
        color: '#98A2B3 !important',
        opacity: 1,
      },
      '&:is(.dark *)::placeholder': {
        color: '#FFFFFF4D !important',
        opacity: 1,
      },
    },
  },
  '& .MuiInputBase-root.Mui-error': {
    border: '1px solid red !important',
  },
  '& .MuiInputLabel-root': {
    color: 'red !important',
  },
  '& .MuiAutocomplete-listbox': {
    zIndex: 10,
  },
  '& .MuiAutocomplete-option': {
    '&[aria-selected="true"], &[data-focus="true"]': {
      padding: 0,
      backgroundColor: '#F4F4F4',
    },
  },
  '& .MuiAutocomplete-endAdornment': {
    right: '0.75rem',
  },
  '@media (max-width: 600px)': {
    '& .MuiInputBase-root': {
      padding: '0.35rem 1rem',
    },
  },
};
