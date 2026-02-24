import React, {useEffect, useState} from 'react';

import FlexxIcon from '@components/FlexxIcon/FlexxIcon';
import {copyToClipboard} from '@/utils/formatter.utils';
import {IconButton, IconButtonProps, useTheme} from '@mui/material';

interface CopyIconButtonProps extends IconButtonProps {
  valueToCopy: string | number | undefined;
  duration?: number;
  iconWidth?: number;
  iconHeight?: number;
  noHoverIconButton?: boolean;
  isLink?: boolean;
}

const CopyIconButton: React.FC<CopyIconButtonProps> = ({
  valueToCopy,
  duration = 2000,
  iconWidth,
  iconHeight,
  noHoverIconButton = false,
  isLink = false,
  ...rest
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), duration);
    return () => clearTimeout(timer);
  }, [copied, duration]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!valueToCopy) return;
    copyToClipboard(String(valueToCopy));
    setCopied(true);
  };

  const iconName = copied
    ? 'fluent--checkmark-20-regular'
    : isLink
      ? 'fluent--link-20-regular'
      : 'fluent--copy-20-regular';

  return (
    <IconButton
      {...rest}
      onClick={handleClick}
      disableRipple={noHoverIconButton ? true : undefined}
      disableTouchRipple={noHoverIconButton ? true : undefined}
      disableFocusRipple={noHoverIconButton ? true : undefined}
      sx={{
        ...(noHoverIconButton && {
          '&:hover': {
            backgroundColor: 'transparent !important',
            opacity: '1 !important',
            transform: 'none !important',
            boxShadow: 'none !important',
          },
          '&:active': {backgroundColor: 'transparent !important'},
          '&:focus': {backgroundColor: 'transparent !important'},
          padding: '0 !important',
          transition: 'none !important',
        }),
        ...rest.sx,
      }}
    >
      <FlexxIcon
        icon={iconName}
        width={iconWidth}
        height={iconHeight}
        color={copied ? theme.palette.success.main : 'inherit'}
      />
    </IconButton>
  );
};

export default CopyIconButton;
