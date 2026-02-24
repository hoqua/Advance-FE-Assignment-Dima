const menu = skin => ({
  MuiMenu: {
    defaultProps: {
      ...(skin === 'bordered' && {
        slotProps: {
          paper: {
            elevation: 0,
            sx: {borderRadius: '4px'},
          },
        },
      }),
    },
    styleOverrides: {
      paper: ({theme}) => ({
        marginBlockStart: theme.spacing(1),
        borderRadius: 0, // Remove border radius on the menu paper
        ...(skin !== 'bordered' && {
          boxShadow: 'var(--mui-customShadows-lg)',
        }),
      }),
    },
  },
  MuiMenuItem: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      root: ({theme}) => ({
        borderRadius: 0, // Remove border radius on menu items
        paddingBlock: theme.spacing(2),
        color: 'var(--mui-palette-text-primary)',
        '&.Mui-selected': {
          backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
          },
        },
        '&.Mui-disabled': {
          color: 'var(--mui-palette-text-disabled)',
          opacity: 1,
        },
      }),
    },
  },
});

export default menu;
