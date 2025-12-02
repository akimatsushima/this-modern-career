import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onReset?: () => void;
  activeSection?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onReset, activeSection = 'hero' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRetracted, setIsRetracted] = useState(false);

  useEffect(() => {
    const handleStickyChange = () => {
      const isSticky = document.body.classList.contains('simulation-sticky');
      setIsRetracted(isSticky);
    };

    const observer = new MutationObserver(handleStickyChange);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

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
    const baseClass = isMobile ? 'navbar-link navbar-link-mobile' : 'navbar-link';
    const activeClass = isActive ? 'navbar-link--active' : '';
    return `${baseClass} ${activeClass}`.trim();
  };

  return (
    <nav
      className={`navbar ${isRetracted ? 'navbar--retracted' : 'navbar--visible'}`}
    >
      <div className="navbar-inner">
        
        {/* Left Side: Name linking to LinkedIn */}
        <div className="flex items-center">
          <a
            href="https://www.linkedin.com/in/akimatsushima/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-brand"
          >
            Aki Matsushima
          </a>
        </div>
        
        {/* Desktop Menu */}
        <div className="navbar-links">
            <button onClick={() => scrollTo('hero')} className={getLinkClass('hero')}>Top</button>
            <button onClick={() => scrollTo('simulation-section')} className={getLinkClass('simulation-section')}>Simulation</button>
            <button onClick={() => scrollTo('dataviz-section')} className={getLinkClass('dataviz-section')}>Analysis</button>
            <button onClick={() => scrollTo('conclusions-section')} className={getLinkClass('conclusions-section')}>Conclusions</button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
            className="navbar-toggle"
                aria-label="Toggle menu"
            >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden navbar-mobile-menu">
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