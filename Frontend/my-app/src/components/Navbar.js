import React, { useState } from "react";
import { Button } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";

const Navbar = ({isDarkMode, setIsDarkMode}) => {

  const handleToggle=()=>{
    setIsDarkMode(!isDarkMode);
  }

  return (
    <div className={`ModalContainer ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <nav className="Navbar">
        <p>NESSCO</p>
        <a href="#">Trip Plan</a>
        <a href="http://localhost:3000/TripPage2">Trip Update</a>
        <a href="#">Trip Search</a>
        <a href="#">Sign In</a>
        <Button
          onClick={handleToggle}
          sx={{ position: "absolute", right: 0, top: 5 }}
        >
          <LightModeIcon />
        </Button>
      </nav>
    </div>
  );
};

export default Navbar;
