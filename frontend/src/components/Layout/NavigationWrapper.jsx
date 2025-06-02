import BottomNav from './BottomNav';

const NavigationWrapper = ({ children, excludeBottomNav = false }) => {
  return (
    <>
      {children}
      {!excludeBottomNav && <BottomNav />}
    </>
  );
};

export default NavigationWrapper;
