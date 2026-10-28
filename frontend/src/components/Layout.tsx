import { Box } from '@mui/material'
import Navbar from './Navbar'
import Footer from './Footer'
export default function Layout({ children }: { children: any }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  )
}
