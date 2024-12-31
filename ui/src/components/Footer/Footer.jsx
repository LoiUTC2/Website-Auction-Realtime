// components/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <p>&copy; 2024 Auction Site. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-accent">
            About
          </Link>
          <Link to="/contact" className="hover:text-accent">
            Contact
          </Link>
          <Link to="/terms" className="hover:text-accent">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
