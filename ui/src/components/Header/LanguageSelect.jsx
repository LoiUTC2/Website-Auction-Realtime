import React, { useEffect, useRef, useState } from 'react'
import vn_flag from '../../assets/vn_flag.png'
import en_flag from '../../assets/en_flag.png'
import { ChevronDown } from 'lucide-react';
const SelectLanguage = ({ language, changeLanguage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLanguageChange = (lang) => {
        setIsOpen(false);
        changeLanguage(lang)
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="flex bg-transparent h-10 p-2 text-white lg:text-black font-medium border-0 outline-0 text-sm rounded-md cursor-pointer items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {language === 'vi' ? (
                    <div className="flex items-center space-x-2">
                        <img src={vn_flag} width={25} height={25} alt="VN Flag" />
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <img src={en_flag} width={25} height={25} alt="EN Flag" />
                    </div>
                )}
                <ChevronDown
                    size={19}
                    className={` ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-md shadow-lg boxshadow-custom z-10 py-2">
                    <div
                        className="flex items-center justify-center p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleLanguageChange('vi')}
                    >
                        <img src={vn_flag} width={25} height={25} alt="VN Flag" />
                        {/* <span className="ml-2 text-sm">Tiếng Việt</span> */}
                    </div>
                    <div
                        className="flex items-center justify-center p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleLanguageChange('en')}
                    >
                        <img src={en_flag} width={25} height={25} alt="EN Flag" />
                        {/* <span className="ml-2 text-sm">English</span> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectLanguage
