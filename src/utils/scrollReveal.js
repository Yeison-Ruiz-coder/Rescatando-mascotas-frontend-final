// src/utils/scrollReveal.js
/**
 * Scroll Reveal - Detecta elementos y los anima al hacer scroll
 * 
 * Uso:
 * 1. Agrega la clase 'reveal-up', 'reveal-left', etc. a los elementos
 * 2. Los elementos se animarán automáticamente cuando aparezcan en pantalla
 */

export const initScrollReveal = () => {
  if (typeof window === 'undefined') return;
  
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Forzar que la animación se ejecute
        const element = entry.target;
        const animationName = window.getComputedStyle(element).animationName;
        
        // Si la animación no está definida o es 'none', forzar
        if (animationName === 'none' || !animationName) {
          element.style.animation = 'none';
          element.offsetHeight; // Reflow
          element.style.animation = null;
        }
        
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.15,  // 15% visible
    rootMargin: '0px 0px -50px 0px'  // Se activa un poco antes
  });
  
  revealElements.forEach(el => observer.observe(el));
  
  return observer;
};

// Componente React para usar como wrapper
import React, { useEffect, useRef } from 'react';

export const RevealOnScroll = ({ children, animation = 'up', delay = 0, duration = 'normal', className = '' }) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15 });
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const animationClass = `reveal-${animation}`;
  const delayClass = delay ? `delay-${delay}` : '';
  const durationClass = duration !== 'normal' ? `duration-${duration}` : '';
  
  return (
    <div 
      ref={elementRef}
      className={`${animationClass} ${delayClass} ${durationClass} ${className}`}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
};