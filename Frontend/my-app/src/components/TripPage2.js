import React, { useState } from "react";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import "./TripPage.css";
import Navbar from "./Navbar.js";
import FormFields from "./FormFields.js";
import { darkTheme, lightTheme } from "../theme.js";

const TripPage2 = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div
        className={`ModalContainer ${isDarkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <FormFields />
      </div>
    </ThemeProvider>
  );
};

export default TripPage2;
