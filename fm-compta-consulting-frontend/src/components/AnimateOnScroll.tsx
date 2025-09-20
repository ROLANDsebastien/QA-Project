import React, { ReactNode, useEffect, useRef, useState } from 'react';

type AnimateOnScrollProps = {
  children: ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in';
  once?: boolean; // Ajout d'une propriété pour contrôler si l'animation ne doit être jouée qu'une seule fois
};

const AnimateOnScroll = ({
  children,
  className = '',
  threshold = 0.1,
  delay = 0,
  animation = 'fade-up',
  once = true, // Par défaut, l'animation ne sera jouée qu'une seule fois
}: AnimateOnScrollProps) => {
  // Désactiver temporairement les animations en retournant les enfants directement avec juste le className
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default AnimateOnScroll;