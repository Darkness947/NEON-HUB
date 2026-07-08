import { useRef, useState, useEffect } from 'react';

const ScrollableRow = ({ children }) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true); // default true assuming content overflows

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      const isRtl = window.getComputedStyle(rowRef.current).direction === 'rtl';
      
      if (isRtl) {
        setCanScrollLeft(Math.abs(Math.floor(scrollLeft)) + clientWidth < scrollWidth);
        setCanScrollRight(Math.ceil(scrollLeft) < 0);
      } else {
        setCanScrollLeft(Math.floor(scrollLeft) > 0);
        setCanScrollRight(Math.ceil(scrollLeft) + clientWidth < scrollWidth);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scrollBy = (amount) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      // Use setTimeout to check after smooth scroll completes (approx 300ms)
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {canScrollLeft && (
        <button 
          className="hero-arrow hero-arrow-left" 
          onClick={() => scrollBy(-400)}
          aria-label="Scroll left"
          style={{ zIndex: 10 }}
        >
          &lt;
        </button>
      )}
      
      <div 
        ref={rowRef}
        className="d-flex gap-3" 
        style={{ 
          overflowX: 'auto', 
          paddingBottom: 'var(--spacing-md)', 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none' 
        }}
        onScroll={checkScroll}
      >
        {children}
      </div>

      {canScrollRight && (
        <button 
          className="hero-arrow hero-arrow-right" 
          onClick={() => scrollBy(400)}
          aria-label="Scroll right"
          style={{ zIndex: 10 }}
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default ScrollableRow;
