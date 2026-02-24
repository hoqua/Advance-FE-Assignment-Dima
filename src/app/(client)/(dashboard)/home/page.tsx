'use client';
import React from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import FlexxDashboardWrapper from '@/components/FlexxDashboardWrapper';

const tasks = [
  {
    title: '1. Account Drawer',
    description:
      "When clicking on an account in the accounts dashboard, open a drawer that has a header with the account's details and a table with all of its transactions.",
    images: ['/images/tasks/img.png', '/images/tasks/img_1.png'],
  },
  {
    title: '2. Create Account',
    description:
      'Implement a "Create Account" CTA on the accounts dashboard. When clicked it should open a drawer with text fields for all the attributes of an account and an "Add Account" button. After creating the account, the accounts dashboard should open the drawer to the newly created account.',
    images: ['/images/tasks/img_2.png'],
  },
  {
    title: '3. Move Money',
    description:
      'Implement a "Move Money" CTA on the accounts dashboard. When clicked it should open a drawer with the following fields: source account, destination account, and amount. Add a checkbox that needs to be checked before being able to initiate the move money. Include a "Move Money" button to submit.',
    images: ['/images/tasks/img_3.png'],
  },
  {
    title: '4. Transactions Dashboard',
    description:
      'Add a transactions dashboard that shows all the transactions in a table.',
    images: ['/images/tasks/img_4.png'],
  },
];

const Home = () => {
  return (
    <FlexxDashboardWrapper>
      <Stack gap={4} sx={{pb: 4}}>
        <Box sx={{py: 2, px: 2}}>
          <Typography variant='h3' sx={{fontWeight: 600, color: 'text.primary'}}>
            Advance Frontend - Interview Assignment
          </Typography>
          <Typography variant='body1' sx={{mt: 1, color: 'text.secondary'}}>
            A Next.js application with the full Advance design system, component
            library, and layout infrastructure.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant='h5' sx={{mb: 2}}>
              Backend API Schema
            </Typography>
            <Link
              href='https://internal-fe-mock-provider.r6zcf729z3zke.us-east-1.cs.amazonlightsail.com/docs'
              target='_blank'
              rel='noopener noreferrer'
            >
              API Documentation
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h5' sx={{mb: 2}}>
              Tasks
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{mb: 2}}>
              This is a FE task evaluating your skills.
            </Typography>

            <Stack gap={4}>
              {tasks.map(task => (
                <Box key={task.title}>
                  <Typography variant='h6'>{task.title}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{mb: 1}}>
                    {task.description}
                  </Typography>
                  <Stack direction='row' gap={2} flexWrap='wrap'>
                    {task.images.map(src => (
                      <Box
                        key={src}
                        component='img'
                        src={src}
                        alt={task.title}
                        sx={{
                          maxWidth: '100%',
                          width: task.images.length > 1 ? 'calc(50% - 8px)' : '100%',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h5' sx={{mb: 2}}>
              Key Components
            </Typography>
            <List dense disablePadding>
              {[
                ['FlexxTable', 'Data table with sorting, filtering, pagination'],
                ['DrawerWrapper', 'Drawer/panel layout component'],
                ['FlexxCustomTextInputs', 'Form input components'],
                ['AdvanceCurrencyText', 'Currency formatting component'],
                ['FlexxDashboardWrapper', 'Page wrapper component'],
              ].map(([name, desc]) => (
                <ListItem key={name} disableGutters>
                  <ListItemText
                    primary={
                      <Typography variant='body2' component='span'>
                        <Chip label={name} size='small' sx={{mr: 1}} />
                        {desc}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h5' sx={{mb: 2}}>
              Stack
            </Typography>
            <Stack direction='row' gap={1} flexWrap='wrap'>
              {[
                'Next.js 16',
                'React 19',
                'TypeScript',
                'MUI v5',
                'Tailwind CSS',
                'React Query v3',
                'React Hook Form',
              ].map(tech => (
                <Chip key={tech} label={tech} variant='outlined' size='small' />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </FlexxDashboardWrapper>
  );
};

export default Home;
