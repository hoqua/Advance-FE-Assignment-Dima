import React, {FC} from 'react';

import FlexxIcon from '@components/FlexxIcon/FlexxIcon';
import {Skeleton, Stack, Tooltip, TooltipProps} from '@mui/material';
import {
  ActionButtonConfig,
  FlexxActionButtonsProps,
  SkeletonSize,
} from '@components/AdvanceActionButtons/types';
import {LoadingButton} from '@mui/lab';

const AdvanceActionButtons: FC<FlexxActionButtonsProps> = ({
  actions,
  containerProps,
  gap = '1.5rem',
  size,
  isLoading,
}) => {
  return (
    <Stack
      direction='row'
      justifyContent='flex-end'
      alignItems='center'
      flexWrap='wrap'
      gap={gap}
      {...containerProps}
    >
      {actions.map(buttonConfig => (
        <AdvanceActionButton
          key={buttonConfig.name}
          {...buttonConfig}
          isLoading={isLoading}
          size={size}
        />
      ))}
    </Stack>
  );
};

interface AdvanceActionButtonProps extends ActionButtonConfig {
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const AdvanceActionButton: React.FC<AdvanceActionButtonProps> = ({
  isLoading,
  size,
  skeletonWidth,
  toolTip,
  variant,
  disabled,
  name,
  color,
  href,
  onClick,
  endIcon,
  startIcon,
  disableToolTip,
  loading,
}) => {
  if (isLoading) {
    return (
      <Skeleton
        height={SkeletonSize[size ?? 'medium']}
        width={skeletonWidth || '8rem'}
      />
    );
  }

  return (
    <ButtonWrapper disableTooltip={disableToolTip} toolTip={toolTip}>
      <LoadingButton
        variant={variant}
        disabled={disabled}
        loading={loading}
        color={color}
        href={href}
        onClick={onClick}
        size={size}
        endIcon={
          endIcon ? (
            <FlexxIcon icon={endIcon} width={20} height={20} />
          ) : undefined
        }
        startIcon={
          startIcon ? (
            <FlexxIcon icon={startIcon} width={20} height={20} />
          ) : undefined
        }
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </LoadingButton>
    </ButtonWrapper>
  );
};

const ButtonWrapper: React.FC<{
  disableTooltip?: boolean;
  toolTip?: Partial<TooltipProps>;
  children: React.ReactNode;
}> = ({disableTooltip, toolTip, children}) => {
  if (disableTooltip) {
    return <>{children}</>;
  }
  return (
    <Tooltip title={''} {...toolTip}>
      <span style={{display: 'inline-block'}}>{children}</span>
    </Tooltip>
  );
};

export default AdvanceActionButtons;
