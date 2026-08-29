// src/components/common/ScrollToTop/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;