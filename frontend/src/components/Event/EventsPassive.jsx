import React, { useEffect, useRef } from 'react';

const EventsPassive = () => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (scrollContainer) {
      // Handle wheel events correctly with passive listeners
      const handleWheel = (e) => {
        // We need to use scrollLeft property instead of preventDefault
        // This avoids the "Unable to preventDefault inside passive event listener" warning
        const scrollAmount = e.deltaY;
        scrollContainer.scrollLeft += scrollAmount;
      };

      // Use passive: true for better scroll performance
      scrollContainer.addEventListener('wheel', handleWheel, { passive: true });
      
      return () => {
        scrollContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="events-container overflow-x-auto"
      style={{ 
        scrollBehavior: 'smooth',
        whiteSpace: 'nowrap',
        padding: '20px 0'
      }}
    >
      {/* Event content goes here */}
      <div className="inline-block px-4 mx-2">Event 1</div>
      <div className="inline-block px-4 mx-2">Event 2</div>
      <div className="inline-block px-4 mx-2">Event 3</div>
    </div>
  );
};

export default EventsPassive;
