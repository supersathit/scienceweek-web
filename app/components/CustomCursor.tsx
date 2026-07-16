"use client";

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices
    if (window.innerWidth >= 768) {
      setIsDesktop(true);
    }

    const moveCursor = (e: MouseEvent) => {
      if (cursorDotRef.current && cursorOutlineRef.current) {
        // Use direct DOM manipulation for performance
        cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        
        // Add a slight lag effect to the outline
        cursorOutlineRef.current.animate({
            transform: `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
        }, { duration: 500, fill: "forwards" });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the element being hovered is clickable
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isClickable) {
        cursorOutlineRef.current?.classList.add('w-16', 'h-16', 'bg-primary/10', 'border-primary/30', 'backdrop-blur-sm');
        cursorOutlineRef.current?.classList.remove('w-8', 'h-8', 'border-primary/50');
        cursorDotRef.current?.classList.add('scale-50', 'opacity-50');
      } else {
        cursorOutlineRef.current?.classList.remove('w-16', 'h-16', 'bg-primary/10', 'border-primary/30', 'backdrop-blur-sm');
        cursorOutlineRef.current?.classList.add('w-8', 'h-8', 'border-primary/50');
        cursorDotRef.current?.classList.remove('scale-50', 'opacity-50');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      <div 
        ref={cursorOutlineRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary/50 pointer-events-none z-[9999] transition-all duration-300 ease-out will-change-transform flex items-center justify-center"
        style={{ transform: 'translate(-100px, -100px)' }}
      />
      <div 
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-secondary rounded-full pointer-events-none z-[10000] transition-all duration-300 will-change-transform"
        style={{ transform: 'translate(-100px, -100px)' }}
      />
    </>
  );
}
