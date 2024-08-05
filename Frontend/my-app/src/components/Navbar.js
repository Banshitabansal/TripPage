import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close';

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleDrawer = (newOpen) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen(newOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 660);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`ModalContainer ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <nav className="Navbar">
        <div className="NavbarLeft">
          {isMobile && (
            <IconButton onClick={toggleDrawer(true)} style={{ padding: 0 }}>
              <MenuIcon />
            </IconButton>
          )}
          <p>NESSCO</p>
        </div>
        <div>
          {isMobile ? (
            <Drawer
              anchor="left"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  width: '100%',
                  height: '100%'
                }
              }}
            >
              <Box
                role="presentation"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <IconButton
                  onClick={toggleDrawer(false)}
                  sx={{ alignSelf: 'flex-end', margin: 1 }}
                >
                  <CloseIcon />
                </IconButton>
                <List sx={{ flexGrow: 1 }}>
                  {[
                    <a href="/TripPage">Trip Payment</a>,
                    <a href="/TripPage2">Trip Update</a>,
                    <a href="#">Trip Search</a>,
                    <a href="#">Sign In</a>,
                  ].map((text, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton sx={{ justifyContent: 'center' }}>
                        <ListItemText primary={text} sx={{ textAlign: 'center' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>
          ) : (
            <div className="NavbarLinks">
              <a href="/TripPage">Trip Payment</a>
              <a href="/TripPage2">Trip Update</a>
              <a href="#">Trip Search</a>
              <a href="#">Sign In</a>
            </div>
          )}
        </div>
        <IconButton onClick={handleToggle}>
          <LightModeIcon />
        </IconButton>
      </nav>
    </div>
  );
};

export default Navbar;
