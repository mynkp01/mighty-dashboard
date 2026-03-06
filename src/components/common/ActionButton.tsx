import { Popover } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { isValidElement, useEffect, useRef, useState } from 'react';

interface ActionButtonProps {
  handleOnView?: () => void;
  handleOnEdit?: () => void;
  handleOnDelete?: () => void;
  handleDownloadPdf?: () => void;
  handleViewDetails?: () => void;
  handleViewCRMPipeline?: () => void;
  handleAttachment?: () => void;
  handleViewCV?: () => void;
  customAction?: React.ReactNode;
  permissions: Record<string, string[]>;
  currentRole: string; // pass the current role
}

export default function ActionButton({
  handleOnView,
  handleOnEdit,
  handleOnDelete,
  handleViewDetails,
  permissions,
  currentRole,
  handleDownloadPdf,
  handleAttachment,
  handleViewCRMPipeline,
  handleViewCV,
  customAction = null,
}: ActionButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rolePermissions = new Set<string>(permissions[currentRole] || []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAnchorEl(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="relative overflow-visible">
      <button
        aria-describedby={id}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="focus:outline-none"
      >
        <EllipsisVertical />
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {rolePermissions.has('view') && handleOnView && (
          <button
            onClick={handleOnView}
            className="block w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            View
          </button>
        )}
        {rolePermissions.has('edit') && handleOnEdit && (
          <button
            onClick={handleOnEdit}
            className="block w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            Edit
          </button>
        )}
        {rolePermissions.has('edit') && handleDownloadPdf && (
          <button
            onClick={handleDownloadPdf}
            className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
          >
            Download PDF
          </button>
        )}
        {rolePermissions.has('edit') && handleViewDetails && (
          <button
            onClick={handleViewDetails}
            className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
          >
            Project Matrix
          </button>
        )}
        {isValidElement(customAction) ? customAction : undefined}
        {rolePermissions.has('delete') && handleOnDelete && (
          <button
            onClick={handleOnDelete}
            className="block w-full px-3 py-1 hover:bg-red-200 dark:hover:bg-red-300 text-left text-red-500 hover:text-black"
          >
            Delete
          </button>
        )}
        {rolePermissions.has('edit') && handleAttachment && (
          <button
            onClick={handleAttachment}
            className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
          >
            Attachment
          </button>
        )}
        {rolePermissions.has('edit') && handleViewCRMPipeline && (
          <button
            onClick={handleViewCRMPipeline}
            className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
          >
            Pipeline Member
          </button>
        )}
        {rolePermissions.has('edit') && handleViewCV && (
          <button
            onClick={handleViewCV}
            className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
          >
            View CV
          </button>
        )}
      </Popover>
    </div>
  );
}
