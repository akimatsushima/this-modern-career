import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onReset?: () => void;
  activeSection?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onReset, activeSection = 'hero' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false); // Close menu on click
  };

  const handleRefresh = () => {
    if (onReset) {
      onReset();
    } else {
      window.scrollTo(0, 0);
      window.location.reload();
    }
    setIsOpen(false);
  };

  const getLinkClass = (sectionId: string, isMobile = false) => {
    const isActive = activeSection === sectionId;
    const baseClass = "cursor-pointer transition-colors";
    const activeClass = isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900';
    const mobileClass = isMobile ? 'block py-3 text-lg border-b border-slate-100 last:border-0' : '';
    
    return `${baseClass} ${activeClass} ${mobileClass}`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-12 md:h-16 bg-[#f8fafc]/90 backdrop-blur-sm z-[100] border-b border-slate-200/50" style={{ fontFamily: '"PP Mori", sans-serif' }}>
      <div className="h-full px-4 md:px-12 flex items-center justify-between">
        
        {/* Left Side: Home Link */}
        <div className="flex items-center">
            <button 
                onClick={handleRefresh}
                className="text-slate-900 hover:text-blue-600 transition-colors font-medium text-sm"
            >
                Aki Matsushima
            </button>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollTo('hero')} className={getLinkClass('hero')}>Top</button>
            <button onClick={() => scrollTo('simulation-section')} className={getLinkClass('simulation-section')}>Simulation</button>
            <button onClick={() => scrollTo('dataviz-section')} className={getLinkClass('dataviz-section')}>Analysis</button>
            <button onClick={() => scrollTo('conclusions-section')} className={getLinkClass('conclusions-section')}>Conclusions</button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
            className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Toggle menu"
            >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-12 md:top-16 left-0 w-full bg-slate-50 border-b border-slate-200 shadow-xl px-6 py-3 flex flex-col">
            <button onClick={() => scrollTo('hero')} className={getLinkClass('hero', true)}>Top</button>
            <button onClick={() => scrollTo('simulation-section')} className={getLinkClass('simulation-section', true)}>Simulation</button>
            <button onClick={() => scrollTo('dataviz-section')} className={getLinkClass('dataviz-section', true)}>Analysis</button>
            <button onClick={() => scrollTo('conclusions-section')} className={getLinkClass('conclusions-section', true)}>Conclusions</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;