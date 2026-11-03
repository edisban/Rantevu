import type { SvgIconComponent } from '@mui/icons-material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import GavelIcon from '@mui/icons-material/Gavel'
import SchoolIcon from '@mui/icons-material/School'
import PetsIcon from '@mui/icons-material/Pets'
import HandymanIcon from '@mui/icons-material/Handyman'

export type Category = { key: string; icon: SvgIconComponent; en: string; el: string; color: string; words: string[] }

// `words` are accent-free, lowercase fragments matched against a provider's specialty
export const CATEGORIES: Category[] = [
  { key: 'doctor', icon: LocalHospitalIcon, en: 'Doctors', el: 'Γιατροί', color: '#0ea5e9',
    words: ['doctor', 'physician', 'cardio', 'derma', 'pediatr', 'orthop', 'gyn', 'ophthal', 'general practitioner', 'γιατρ', 'παθολογ', 'καρδιολογ', 'δερματολογ', 'παιδιατρ', 'ορθοπαιδ', 'γυναικολογ', 'οφθαλμιατρ', 'ωρλ'] },
  { key: 'dentist', icon: MedicalServicesIcon, en: 'Dentists', el: 'Οδοντίατροι', color: '#14b8a6', words: ['dent', 'orthodont', 'οδοντ'] },
  { key: 'physio', icon: AccessibilityNewIcon, en: 'Physiotherapy', el: 'Φυσικοθεραπεία', color: '#22c55e', words: ['physio', 'chiropract', 'φυσικοθεραπ'] },
  { key: 'psych', icon: PsychologyIcon, en: 'Psychology', el: 'Ψυχολογία', color: '#a855f7', words: ['psych', 'therapist', 'counsel', 'ψυχ'] },
  { key: 'beauty', icon: ContentCutIcon, en: 'Hair & Beauty', el: 'Ομορφιά', color: '#ec4899', words: ['hair', 'beaut', 'barber', 'nail', 'makeup', 'κομμ', 'κουρ', 'αισθητ', 'ομορφ'] },
  { key: 'fitness', icon: FitnessCenterIcon, en: 'Fitness', el: 'Γυμναστική', color: '#f97316', words: ['fitness', 'trainer', 'gym', 'yoga', 'pilates', 'γυμν', 'προπονη'] },
  { key: 'legal', icon: GavelIcon, en: 'Legal', el: 'Νομικά', color: '#6366f1', words: ['law', 'legal', 'attorney', 'notary', 'δικηγορ', 'νομικ', 'συμβολαιογραφ'] },
  { key: 'tutor', icon: SchoolIcon, en: 'Tutoring', el: 'Μαθήματα', color: '#eab308', words: ['tutor', 'teacher', 'lesson', 'καθηγητ', 'δασκαλ', 'μαθηματ'] },
  { key: 'vet', icon: PetsIcon, en: 'Veterinary', el: 'Κτηνίατροι', color: '#84cc16', words: ['vet', 'κτηνιατρ'] },
  { key: 'home', icon: HandymanIcon, en: 'Home services', el: 'Τεχνικοί', color: '#64748b', words: ['plumb', 'electric', 'handyman', 'repair', 'υδραυλ', 'ηλεκτρολογ', 'τεχνικ'] },
]

export const SPECIALTY_SUGGESTIONS: Record<'en' | 'el', string[]> = {
  en: ['General Practitioner', 'Dentist', 'Orthodontist', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Gynecologist', 'Ophthalmologist',
    'Physiotherapist', 'Psychologist', 'Hair Stylist', 'Beautician', 'Personal Trainer', 'Lawyer', 'Notary', 'Tutor', 'Veterinarian', 'Electrician', 'Plumber'],
  el: ['Παθολόγος', 'Οδοντίατρος', 'Ορθοδοντικός', 'Καρδιολόγος', 'Δερματολόγος', 'Παιδίατρος', 'Γυναικολόγος', 'Οφθαλμίατρος',
    'Φυσικοθεραπευτής', 'Ψυχολόγος', 'Κομμωτής', 'Αισθητικός', 'Προπονητής', 'Δικηγόρος', 'Συμβολαιογράφος', 'Καθηγητής', 'Κτηνίατρος', 'Ηλεκτρολόγος', 'Υδραυλικός'],
}

export const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function categoryOf(specialty?: string | null): Category | undefined {
  if (!specialty) return undefined
  const s = normalize(specialty)
  return CATEGORIES.find(c => c.words.some(w => s.includes(w)))
}

export function initials(name?: string | null) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('')
}
