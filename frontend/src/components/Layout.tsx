import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="p-6">
      <Header title={title} subtitle={subtitle} />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}