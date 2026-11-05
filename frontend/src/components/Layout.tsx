import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import Navbar from './Navbar'
import Footer from './Footer'
import Intro from './Intro'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Intro />
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1 }}>{children}</Box>
        <Footer />
      </Box>
    </>
  )
}
