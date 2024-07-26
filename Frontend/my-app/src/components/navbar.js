import React from 'react'

const navbar = () => {
  return (
    <>
      <nav className='Navbar'>
        <p>NESSCO</p>
        <a href='#'>Trip Plan</a>
        <a href='#'>Trip Search</a>
        <a href='#'>Sign In</a>
        <Button onClick={toggleTheme} sx={{ position: 'absolute', right: 0, top: 5 }}>
          <LightModeIcon />
        </Button>
      </nav>
    </>
  )
}

export default navbar;
