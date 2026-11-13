import { Box, Container, Typography } from '@mui/material'
import { useLang } from '../i18n'
import Logo from './Logo'

export default function Footer() {
  const { t } = useLang()
  return (
    <Box component="footer" sx={{ mt: 8, py: 4, borderTop: 1, borderColor: 'divider' }}>
      <Container sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <Typography variant="body2" color="text.secondary">© 2026 Rendezvous · {t('footer')}</Typography>
      </Container>
    </Box>
  )
}
