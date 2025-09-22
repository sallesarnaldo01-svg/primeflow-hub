import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex flex-col transition-all duration-300",
        "md:ml-70",
        sidebarCollapsed && "md:ml-20"
      )}>
        <Header />
        
        <motion.main 
          className="flex-1 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}