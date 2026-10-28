import { createContext, useContext, useState } from 'react'

type Lang = 'el' | 'en'
const dict: Record<Lang, Record<string, string>> = {
  el: {
    home: 'Αρχική', login: 'Σύνδεση', register: 'Εγγραφή', logout: 'Αποσύνδεση',
    signIn: 'Σύνδεση', signUp: 'Εγγραφή', client: 'Πελάτης / Ασθενής', provider: 'Επαγγελματίας / Γιατρός',
    username: 'Όνομα χρήστη', email: 'Email', password: 'Κωδικός πρόσβασης', fullName: 'Ονοματεπώνυμο',
    phone: 'Τηλέφωνο', specialty: 'Ειδικότητα', address: 'Διεύθυνση', bio: 'Σύντομο Βιογραφικό',
    price: 'Τιμή Επίσκεψης (€)', success: 'Επιτυχής εγγραφή!', error: 'Λάθος στοιχεία σύνδεσης',
    profile: 'Προφίλ', save: 'Αποθήκευση', toggle: 'EN',
    footer: '© 2026 Rantevu - Όλες οι υπηρεσίες κρατήσεων σε ένα μέρος'
  },
  en: {
    home: 'Home', login: 'Login', register: 'Register', logout: 'Logout',
    signIn: 'Login', signUp: 'Register', client: 'Client / Patient', provider: 'Professional / Doctor',
    username: 'Username', email: 'Email', password: 'Password', fullName: 'Full name',
    phone: 'Phone', specialty: 'Specialty', address: 'Address', bio: 'Short bio',
    price: 'Visit price (€)', success: 'Registration successful!', error: 'Invalid credentials',
    profile: 'Profile', save: 'Save', toggle: 'EL',
    footer: '© 2026 Rantevu - All booking services in one place'
  }
}

const Ctx = createContext<any>(null)
export function LangProvider({ children }: any) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'el')
  const toggle = () => { const n = lang === 'el' ? 'en' : 'el'; setLang(n); localStorage.setItem('lang', n) }
  return <Ctx.Provider value={{ lang, t: (k: string) => dict[lang][k] ?? k, toggle }}>{children}</Ctx.Provider>
}
export const useLang = () => useContext(Ctx)
