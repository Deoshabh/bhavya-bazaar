import React from 'react';
import BottomNav from './BottomNav';
import GlobalNavButtons from './GlobalNavButtons';

const NavigationWrapper = ({ children, excludeGlobalNav = false, excludeBottomNav = false }) => {
  return (
    <>
      {children}
      {!excludeGlobalNav && <GlobalNavButtons />}
      {!excludeBottomNav && <BottomNav />}
    </>
  );
};

export default NavigationWrapper;
