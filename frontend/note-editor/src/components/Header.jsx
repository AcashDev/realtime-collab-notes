// src/components/Header.js
import React, { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Header = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-purple-700 text-white shadow-md">
      <div className="w-full  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-xl">CollabNotes</div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/home" className="text-white hover:text-gray-200">
              Home
            </Link>
            <span className="block px-3 py-2">{"Hello " +( JSON.parse(localStorage.getItem("user") || null)?.name || "Dummy")}</span>
            <span className="ml-4 cursor-pointer" onClick={() => {localStorage.removeItem("jwt"); window.location.reload();}}>Logout</span>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <XMarkIcon className="h-6 w-6  text-black" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-black" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-purple-600 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/home"
            className="block hover:bg-purple-500 px-3 py-2 rounded"
          >
            Home
          </Link>
          <span className="block px-3 py-2">{"Hello " +( JSON.parse(localStorage.getItem("user") || null)?.name || "Dummy")}</span>
          <span className="ml-4 cursor-pointer" onClick={() => {localStorage.removeItem("jwt"); window.location.reload();}}>Logout</span>
        </nav>
      )}
    </header>
  );
};

export default Header;
