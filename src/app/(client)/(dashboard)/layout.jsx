import dynamic from 'next/dynamic';
// Config Imports
import {i18n} from '@configs/i18n';
// MUI Imports
import Button from '@mui/material/Button';
// Component Imports
import Providers from '@components/Providers';
// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper';
// Util Imports
import {getDictionary} from '@/utils/getDictionary';
import VerticalLayout from '@layouts/VerticalLayout';
import ScrollToTop from '@core/components/scroll-to-top';
import Navbar from '@components/FlexxLayout/FlexxVerticalLayout/Navbar';
import {getMode, getSkin, getSystemMode} from '@core/utils/serverHelpers';
import Navigation from '@components/FlexxLayout/FlexxVerticalLayout/Navigation';

const HorizontalLayout = dynamic(() => import('@layouts/HorizontalLayout'));
const Header = dynamic(
  () => import('@components/FlexxLayout/FlexxHorizontalLayout/Header'),
);
const HorizontalFooter = dynamic(
  () => import('@components/FlexxLayout/FlexxHorizontalLayout/Footer'),
);

const Layout = async props => {
  const params = await props.params;

  const {children} = props;

  // Vars
  const direction = i18n.langDirection[params.lang];
  const dictionary = await getDictionary(params.lang);
  const mode = getMode();
  const systemMode = getSystemMode();
  const skin = getSkin();

  return (
    <Providers direction={direction}>
      <LayoutWrapper
        systemMode={systemMode}
        verticalLayout={
          <VerticalLayout
            navigation={
              <Navigation
                dictionary={dictionary}
                mode={mode}
                systemMode={systemMode}
                skin={skin}
              />
            }
            navbar={<Navbar />}
          >
            {children}
          </VerticalLayout>
        }
        horizontalLayout={
          <HorizontalLayout
            header={<Header dictionary={dictionary} />}
            footer={<HorizontalFooter />}
          >
            {children}
          </HorizontalLayout>
        }
      />
      <ScrollToTop className='mui-fixed'>
        <Button
          variant='contained'
          className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
        >
          <i className='ri-arrow-up-line' />
        </Button>
      </ScrollToTop>
    </Providers>
  );
};

export default Layout;
