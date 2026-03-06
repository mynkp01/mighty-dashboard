import { Popover } from '@mui/material';
import { Link } from 'react-router';

interface DetailsPopoverProps {
  id: string;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  data: any;
  type?: 'company' | 'client';
  listContainerClass?: string;
  customFields?: {
    key: string;
    label?: string;
    isEmail?: boolean;
    isLink?: boolean;
    isDate?: boolean;
  }[];
}

const DetailsPopover = ({
  id,
  open,
  anchorEl,
  onClose,
  onMouseEnter,
  onMouseLeave,
  data,
  type,
  listContainerClass,
  customFields,
}: DetailsPopoverProps) => {
  const companyFields = [
    { label: 'Company Name', key: 'company_name' },
    { label: 'Email', key: 'email', isEmail: true },
    { label: 'Phone Number', key: 'phone_number' },
    { label: 'Website', key: 'website', isLink: true },
  ];

  const clientFields = [
    { label: 'Name', key: 'name' },
    { label: 'Date of Birth', key: 'date_of_birth', isDate: true },
    { label: 'Email', key: 'email', isEmail: true },
    { label: 'Designation', key: 'designation' },
    { label: 'LinkedIn', key: 'linkedin', isLink: true },
    { label: 'Phone Number', key: 'phone_number' },
    { label: 'Address', key: 'address' },
  ];

  const fields =
    type === 'company'
      ? companyFields
      : type === 'client'
      ? clientFields
      : customFields;

  const renderValue = (field: any, value: any) => {
    if (!value) return <p className="text-sm text-gray-600">-</p>;

    if (field.isEmail) {
      return (
        <Link
          to={`mailto:${value}`}
          className="text-sm text-gray-600 hover:underline"
        >
          {value}
        </Link>
      );
    }

    if (field.isLink) {
      return (
        <Link
          to={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:underline"
        >
          {value}
        </Link>
      );
    }

    if (field.isDate) {
      return (
        <p className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </p>
      );
    }

    return <p className="text-sm text-gray-600">{value}</p>;
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          onMouseEnter,
          onMouseLeave,
          sx: { p: 2, minWidth: 250, maxWidth: 400 },
        },
      }}
    >
      {data && (
        <div className={`grid grid-cols-2 gap-3 ${listContainerClass}`}>
          {fields?.map((field) => (
            <div key={field.key}>
              <p className="font-semibold text-gray-900 text-xs">
                {field.label}
              </p>
              {renderValue(field, data[field.key])}
            </div>
          ))}
        </div>
      )}
    </Popover>
  );
};

export default DetailsPopover;
