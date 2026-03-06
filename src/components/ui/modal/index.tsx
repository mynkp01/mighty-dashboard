import { IconButton, Modal as MuiModal } from '@mui/material';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

// const StyledBox = styled(Box)<{ isFullscreen?: boolean }>(
//   ({ theme, isFullscreen }) => ({
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: isFullscreen ? '100%' : 'auto',
//     height: isFullscreen ? '100%' : 'auto',
//     backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
//     borderRadius: isFullscreen ? 0 : '6px',
//     boxShadow: 24,
//     outline: 'none',
//     maxHeight: '90vh',
//     overflow: 'auto',
//   }),
// );

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const contentClasses = isFullscreen
    ? 'w-full h-full'
    : 'relative w-full rounded-md bg-white dark:bg-gray-900';

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      classes={{ root: '!flex !items-center !justify-center !p-8' }}
      sx={{
        backdropFilter: !isFullscreen ? 'blur(32px)' : 'none',
        '& .MuiBackdrop-root': {
          backgroundColor: !isFullscreen
            ? 'rgba(156, 163, 175, 0.5)'
            : 'transparent',
        },
      }}
    >
      <div className={`${contentClasses} ${className}`}>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            className="!absolute !right-3 !top-3 !z-999 !flex !items-center !justify-center !rounded-full !text-gray-400 !transition-colors hover:!bg-gray-200 hover:!text-gray-700 dark:!bg-gray-800 dark:!text-gray-400 dark:hover:!bg-gray-700 dark:hover:!text-white !size-8"
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        )}
        {children}
      </div>
    </MuiModal>
  );
};
