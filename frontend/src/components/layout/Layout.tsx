import { ReactNode } from 'react';
import Header from './Header';
import { useSidebar } from '../../contexts/SidebarContext';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const sidebarContext = useSidebar();

  const showMenuButton = sidebarContext !== null;
  const onMenuClick = sidebarContext && !sidebarContext.isOpen ? sidebarContext.openSidebar : undefined;

  return (
    <div className="p-4 sm:p-6 lg:px-6 lg:pt-6 lg:pb-8 min-h-screen">
      <Header 
        title={title} 
        subtitle={subtitle} 
        onMenuClick={onMenuClick} 
        showMenuButton={showMenuButton} 
      />
      <div className="mt-4 sm:mt-6">
        {children}
      </div>
    </div>
  );
}

