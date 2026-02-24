import React, {useState} from 'react';

import {IconButton, Skeleton, Stack, Typography, TypographyProps, TypographyVariant} from '@mui/material';
import {formatAccountNumber, formatFullAccountNumber} from '@/utils/formatter.utils';
import CopyIconButton from '@components/CopyIconButton/CopyIconButton';
import FlexxIcon from '@components/FlexxIcon/FlexxIcon';

interface AdvanceAccountNumberDisplayProps {
  accountNumber?: string;
  isLoading?: boolean;
  removeClipboardIcon?: boolean;
  removeEyeIcon?: boolean;
  variant?: TypographyVariant;
  fontWeight?: TypographyProps['fontWeight'];
}

const monoFont = {fontFamily: 'monospace'};

const AdvanceAccountNumberDisplay: React.FC<
  AdvanceAccountNumberDisplayProps
> = ({
  accountNumber,
  isLoading,
  removeClipboardIcon,
  variant,
  removeEyeIcon,
  fontWeight,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isLoading) {
    return <Skeleton width={100} height={28} />;
  }

  if (!accountNumber) {
    return (
      <Typography variant={variant ?? 'h2'} color='secondary.main'>
        N/A
      </Typography>
    );
  }

  const fullDisplay = formatFullAccountNumber(accountNumber);
  const maskedDisplay = formatAccountNumber(accountNumber);

  return (
    <Stack direction='row' alignItems='center' gap={1.5}>
      <Typography
        variant={variant ?? 'h2'}
        color='secondary.main'
        fontWeight={fontWeight}
        sx={{textWrap: 'nowrap', ...monoFont}}
      >
        {isRevealed ? fullDisplay : maskedDisplay}
      </Typography>
      <Stack direction='row' alignItems='center' gap={0.25}>
        {!removeEyeIcon && (
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation();
              setIsRevealed(prev => !prev);
            }}
            sx={{
              '&:hover': {backgroundColor: 'transparent'},
              p: 0,
            }}
          >
            <FlexxIcon
              icon={isRevealed ? 'fluent--eye-off-20-regular' : 'fluent--eye-20-regular'}
              width={20}
              height={20}
            />
          </IconButton>
        )}
        {!removeClipboardIcon && (
          <CopyIconButton
            valueToCopy={accountNumber}
            iconHeight={20}
            iconWidth={20}
            noHoverIconButton
            size='small'
          />
        )}
      </Stack>
    </Stack>
  );
};
export default AdvanceAccountNumberDisplay;
