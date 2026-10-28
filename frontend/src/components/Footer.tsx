import { Box, Container, Typography } from '@mui/material'
export default function Footer() {
  return (
    <Box sx={{ mt: 6, py: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
      <Container>
        <Typography variant="body2" color="text.secondary">© 2026 rantevu - Όλες οι υπηρεσίες κρατήσεων σε ένα μέρος</Typography>
      </Container>
    </Box>
  )
}
