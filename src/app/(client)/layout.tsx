import React from 'react';
// Next imports
import {Metadata} from 'next';

// Import i18n configuration
import {i18n} from '@configs/i18n';

// Import third-party and style dependencies
import 'react-perfect-scrollbar/dist/css/styles.css';
import '@/app/globals.css';
import '@assets/iconify-icons/generated-icons.css';

// Component imports
import ReactQueryProvider from '@components/ReactQueryProvider/ReactQueryProvider';
import {NuqsAdapter} from 'nuqs/adapters/next/app';

interface RootLayoutProps {
  children: React.ReactNode;
  // eslint-disable-next-line
  params: Promise<any>;
}

export const metadata: Metadata = {
  title: 'Advance | Interview Assignment',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/icon2.png',
        href: '/icon2.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/icon1.png',
        href: '/icon1.png',
      },
    ],
  },
};

const RootLayout: React.FC<RootLayoutProps> = async props => {
  const params = await props.params;

  const {children} = props;

  // @ts-expect-error any type
  const direction = i18n.langDirection[params.lang];

  return (
    <html id='__next' lang={params.lang} dir={direction}>
      <ReactQueryProvider>
        <NuqsAdapter>
          <body className='flex is-full min-bs-full flex-auto flex-col'>
            {children}
          </body>
        </NuqsAdapter>
      </ReactQueryProvider>
    </html>
  );
};

export default RootLayout;
