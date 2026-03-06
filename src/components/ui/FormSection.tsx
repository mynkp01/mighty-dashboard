import React, { ReactNode } from 'react';
import AnimatedCard from './AnimatedCard';

interface FormSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  delay = 0,
}) => {
  return (
    <AnimatedCard gradient delay={delay}>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
        {icon}
        {title}
      </h2>
      {children}
    </AnimatedCard>
  );
};

export default FormSection;