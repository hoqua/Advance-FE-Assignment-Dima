import debounce from 'lodash/debounce';
import {useEffect, useState} from 'react';

export const useWindowResize = (delay = 100) => {
  const isClient = typeof window !== 'undefined';

  const getSize = () => ({
    height: isClient ? window.innerHeight : 0,
    width: isClient ? window.innerWidth : 0,
  });

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = debounce(() => {
      setSize(getSize());
    }, delay);

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [delay, isClient]);

  return size;
};
