import React, {useCallback, useEffect, useRef, useState} from 'react';

import Collapse from '@mui/material/Collapse';
import FlexxIcon from '@/components/FlexxIcon/FlexxIcon';
import {VERTICAL_MENU_WIDTH} from '@menu/components/vertical-menu/Menu';
import {
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export type drawerSizes = 'sm' | 'md' | 'lg' | 'xl' | 'half' | 'full';
export type expandedDrawerComponentSizes =
  | '30vw'
  | '40vw'
  | '50vw'
  | 'fill'
  | string;
export type Action = {
  onClick: () => void;
  icon: string;
};

interface DrawerWrapperProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  anchor?: 'right' | 'left';
  drawerWidth?: drawerSizes;
  children: React.ReactNode;
  removePaddingBottom?: boolean;
  extraComponentWidth?: expandedDrawerComponentSizes;
  extraComponent?: React.ReactNode;
  removeVerticalPadding?: boolean;
  actions?: Action[];
  fixedActions?: boolean;
  expansionCTAs?: Action[];
}

const widthMap: Record<drawerSizes, string> = {
  sm: '25vw',
  md: '35vw',
  half: '50vw',
  lg: '55vw',
  xl: '70vw',
  full: '100vw',
};

const DrawerWrapper: React.FC<DrawerWrapperProps> = ({
  open,
  title,
  actions,
  onClose,
  children,
  drawerWidth,
  extraComponent,
  anchor = 'right',
  removePaddingBottom,
  removeVerticalPadding,
  extraComponentWidth,
  fixedActions = true,
  expansionCTAs,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const mainComponentRef = useRef<HTMLDivElement>(null);
  const expandedComponentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const expand = Boolean(extraComponent);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [drawerRefWidth, setDrawerRefWidth] = useState(0);
  const [formattedExtraComponentWidth, setFormattedExtraComponentWidth] =
    useState<expandedDrawerComponentSizes | undefined>(undefined);
  const [showMainComponentOnSmDown, setShowMainComponentOnSmDown] =
    useState(!expand);

  let drawerWidthComputed = drawerWidth || 'lg';

  if (!isLgUp && drawerWidthComputed === 'xl') {
    drawerWidthComputed = 'full';
  }
  if (
    !isLgUp &&
    (drawerWidthComputed === 'lg' || drawerWidthComputed === 'half')
  ) {
    drawerWidthComputed = 'xl';
  }
  if (!isMdUp) {
    drawerWidthComputed = 'full';
  }

  useEffect(() => {
    if (!open) return;

    const updateMeasurements = () => {
      setScreenWidth(window.innerWidth);
      setDrawerRefWidth(drawerRef.current?.offsetWidth || 0);
    };

    updateMeasurements();

    const resizeObserver = new ResizeObserver(updateMeasurements);

    if (drawerRef.current) resizeObserver.observe(drawerRef.current);
    if (expandedComponentRef.current)
      resizeObserver.observe(expandedComponentRef.current);
    if (mainComponentRef.current)
      resizeObserver.observe(mainComponentRef.current);

    window.addEventListener('resize', updateMeasurements);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [open, expand]);

  useEffect(() => {
    if (isSmDown && expand) {
      setShowMainComponentOnSmDown(false);
    } else {
      setShowMainComponentOnSmDown(true);
    }
  }, [isSmDown, expand]);

  const width = React.useMemo(() => {
    return widthMap[drawerWidthComputed];
  }, [drawerWidthComputed]);

  const formatExtraComponentWidth = useCallback(() => {
    if (!extraComponentWidth || extraComponentWidth === 'fill') {
      const formattedMainWidth = Number(width.replace(/\D/g, ''));

      let availableWidth = 100 - formattedMainWidth;

      availableWidth = Math.min(availableWidth, formattedMainWidth);

      return `${Math.max(25, availableWidth)}vw`;
    }
    return extraComponentWidth;
  }, [extraComponentWidth, width]);

  useEffect(() => {
    if (extraComponent) {
      setFormattedExtraComponentWidth(formatExtraComponentWidth());
    } else {
      setTimeout(() => {
        setFormattedExtraComponentWidth(undefined);
      }, 300);
    }
  }, [extraComponent, formatExtraComponentWidth]);

  const isFullWidth = React.useMemo(() => {
    return drawerRefWidth + VERTICAL_MENU_WIDTH >= screenWidth;
  }, [screenWidth, drawerRefWidth]);

  const padding = React.useMemo(() => {
    if (isSmDown) {
      if (removeVerticalPadding) return '0rem 2rem 0rem 2rem';
      if (removePaddingBottom) return '6rem 2rem 0rem 2rem';
      return '6rem 2rem 4rem 2rem';
    }
    if (removeVerticalPadding) return '0rem 2rem 0rem 2rem';
    if (removePaddingBottom) return '4rem 2rem 0rem 2rem';
    return '6rem 2rem 4rem 2rem';
  }, [isSmDown, removePaddingBottom, removeVerticalPadding]);

  const buttonsPosition = React.useMemo(() => {
    if (removeVerticalPadding) return {top: '2rem', right: '2rem'};
    if (removePaddingBottom) return {top: '4rem', right: '2rem'};
    return {top: '6rem', right: '2rem'};
  }, [removeVerticalPadding, removePaddingBottom]);

  const actualButtonsPosition = React.useMemo(() => {
    if (fixedActions && expand) {
      return {
        ...buttonsPosition,
        right:
          isSmDown || drawerWidth == 'sm'
            ? '2rem'
            : `calc(100% - ${width} + 2rem)`,
      };
    }
    return buttonsPosition;
  }, [fixedActions, expand, buttonsPosition, width, isSmDown]);

  const modifiedActions = React.useMemo(() => {
    if (!actions?.length) return actions;

    return actions.map(action => {
      if (action.icon === 'fluent--dismiss-24-regular' && expand) {
        return {
          ...action,
          icon:
            anchor === 'right'
              ? 'fluent--chevron-right-24-regular'
              : 'fluent--chevron-left-24-regular',
        };
      }
      return action;
    });
  }, [actions, expand, anchor]);

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      style={
        isFullWidth ? {zIndex: 'var(--drawer-extended-z-index) !important'} : {}
      }
      ModalProps={{
        onClickCapture: (e: React.MouseEvent) => {
          const paper = (e.currentTarget as HTMLElement).querySelector('.MuiDrawer-paper');
          if (paper && !paper.contains(e.target as Node)) {
            onClose();
          }
        },
      }}
      PaperProps={{
        style: {
          minWidth: isSmDown ? '100%' : '500px',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      {modifiedActions?.length && (
        <Stack
          direction='row'
          alignItems='center'
          gap='0.5rem'
          zIndex={2}
          position={'absolute'}
          top={actualButtonsPosition.top}
          right={actualButtonsPosition.right}
        >
          {modifiedActions.map((action, index) => (
            <IconButton
              key={`${action.icon}-${index}`}
              onClick={e => {
                e.stopPropagation();
                action.onClick?.();
              }}
            >
              <FlexxIcon icon={action.icon} />
            </IconButton>
          ))}
        </Stack>
      )}

      {expand && extraComponent && onClose && (
        <Stack
          direction='row'
          alignItems='center'
          gap='0.5rem'
          zIndex={3}
          position={'absolute'}
          top={buttonsPosition.top}
          right={buttonsPosition.right}
        >
          {expansionCTAs &&
            expansionCTAs.map((action, index) => (
              <IconButton
                key={`${action.icon}-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
              >
                <FlexxIcon icon={action.icon} />
              </IconButton>
            ))}
          <IconButton
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
          >
            <FlexxIcon icon='fluent--dismiss-24-regular' />
          </IconButton>
        </Stack>
      )}

      <Stack
        direction='row'
        ref={drawerRef}
        sx={{width: '100%', height: '100%', overflow: 'hidden'}}
      >
        <Collapse
          in={showMainComponentOnSmDown}
          timeout={300}
          orientation='horizontal'
        >
          <Stack
            ref={mainComponentRef}
            sx={{
              width,
              padding,
              gap: '2rem',
              height: '100%',
              transition: theme.transitions.create('width', {
                duration: 300,
                easing: theme.transitions.easing.easeInOut,
              }),
              minWidth: isSmDown ? '100%' : '500px',
            }}
          >
            {title && <Typography variant='h1'>{title}</Typography>}
            {children}
          </Stack>
        </Collapse>
        <Collapse in={expand} timeout={300} orientation='horizontal'>
          <Stack
            ref={expandedComponentRef}
            sx={theme => ({
              backgroundColor: 'background.default',
              p: padding,
              gap: '2rem',
              width: isSmDown ? '100%' : formattedExtraComponentWidth,
              maxWidth: isSmDown ? '100%' : `calc(${screenWidth}px - 500px)`,
              minWidth: extraComponent && !isSmDown ? '300px' : undefined,
              height: '100%',
              overflow: 'hidden',
              transition: theme.transitions.create('width', {
                duration: 300,
                easing: theme.transitions.easing.easeInOut,
              }),
              willChange: 'width',
            })}
          >
            {extraComponent}
          </Stack>
        </Collapse>
      </Stack>
    </Drawer>
  );
};

export default DrawerWrapper;
