import { Box, Button, Popover } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router';
import { isEmpty } from '../../../utils/helper';

const MAX_VISIBLE_BADGES = 2;

const AssignToBadges = ({
  names = [],
  label,
  openLink = false,
}: {
  names: [];
  label: string;
  openLink?: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const visibleNames = names.slice(0, MAX_VISIBLE_BADGES);
  const hiddenNames = names.slice(MAX_VISIBLE_BADGES);
  const hiddenCount = hiddenNames?.filter((i: any) => !isEmpty(i?.name)).length;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className="flex flex-col items-start gap-1 max-w-xs">
      {isEmpty(visibleNames) ? (
        <p className="text-gray-800 px-3 py-1 text-xs font-medium">-</p>
      ) : (
        visibleNames.map((user: any, idx) => {
          const userName = user?.[label];
          const link = user?.linkedin;

          if (openLink && link) {
            const fullUrl = link.startsWith('http') ? link : `https://${link}`;

            return (
              <Link
                to={fullUrl}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium cursor-pointer"
              >
                {userName}
              </Link>
            );
          }

          // fallback: just show text
          return (
            <span
              key={idx}
              className={`text-gray-800 px-3 py-1 text-xs font-medium ${
                userName ? 'rounded-full bg-gray-100' : ''
              }`}
            >
              {!isEmpty(userName) ? userName : '-'}
            </span>
          );
        })
      )}

      {hiddenCount > 0 && (
        <>
          <Button
            size="small"
            variant="outlined"
            className="!rounded-full !text-xs !border !border-gray-300 !text-gray-700 !bg-white !px-2 !min-w-fit !py-0"
            onClick={handleClick}
          >
            +{hiddenCount}
          </Button>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box className="p-3 max-w-[280px] flex flex-wrap gap-2">
              {hiddenNames.map((user: any, idx) => {
                const userName = user?.[label];
                const link = user?.linkedin;

                if (openLink && link) {
                  const fullUrl = link.startsWith('http')
                    ? link
                    : `https://${link}`;

                  return (
                    <Link
                      to={fullUrl}
                      key={idx}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium cursor-pointer"
                    >
                      {userName}
                    </Link>
                  );
                }

                // fallback: just show text
                return (
                  <span
                    key={idx}
                    className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium"
                  >
                    {userName || null}
                  </span>
                );
              })}
            </Box>
          </Popover>
        </>
      )}
    </div>
  );
};

export default AssignToBadges;
