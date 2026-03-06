// Animation utility classes and configurations
export const animations = {
  // Page transitions
  pageTransition: 'transition-all duration-500 ease-in-out',

  // Card animations
  cardHover:
    'hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out',
  cardEntry: 'animate-fadeInUp',

  // Button animations
  buttonHover:
    'hover:scale-105 active:scale-95 transition-transform duration-200',
  buttonPulse: 'animate-pulse',

  // Loading states
  skeleton:
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',

  // Sidebar animations
  sidebarSlide: 'transition-all duration-300 ease-in-out',

  // Modal animations
  modalBackdrop: 'animate-fadeIn',
  modalContent: 'animate-fadeInUp',

  // List item animations
  listItemHover:
    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200',

  // Form animations
  inputFocus:
    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200',

  // Notification animations
  slideInRight: 'animate-slideInRight',
  slideOutRight: 'animate-slideOutRight',
};

// Stagger animation delays for lists
export const staggerDelays = {
  item1: 'animation-delay-100',
  item2: 'animation-delay-200',
  item3: 'animation-delay-300',
  item4: 'animation-delay-400',
  item5: 'animation-delay-500',
};

// Custom animation variants for framer-motion (if you want to add it later)
export const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  },
};
