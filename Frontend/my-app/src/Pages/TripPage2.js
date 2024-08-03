import React, { useState } from "react";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import "../Styles/TripPage.css";
import Navbar from "../components/Navbar.js";
import FormFields from "../components/FormFields.js";
import { darkTheme, lightTheme } from "../theme.js";

const TripPage2 = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div
        className={`ModalContainer ${isDarkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <FormFields page="TripPage2" />
      </div>
    </ThemeProvider>
  );
};

export default TripPage2;
