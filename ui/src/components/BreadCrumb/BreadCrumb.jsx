import React from "react";
import { Link } from "react-router-dom"; // Hoặc dùng thẻ <a> nếu bạn không dùng react-router

const Breadcrumb = ({ items,title }) => {
    return (
        <div className="w-full mt-2 border-b border-[#E6E6E6]">
            <nav aria-label="Breadcrumb" className=" container  py-6 !mx-auto px-10 bg-breadcrumb">
                <h2 className="mb-4 text-3xl font-semibold">{ title}</h2>
                <ol className="flex space-x-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center">
                            {index !== 0 && (
                                <span className="mx-2 text-gray-500">/</span> 
                            )}
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="text-gray-500 hover:text-blue-800"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-semibold">{item.label}</span> 
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumb;
