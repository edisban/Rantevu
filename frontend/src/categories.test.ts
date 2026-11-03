import { describe, expect, it } from 'vitest'
import { SPECIALTY_SUGGESTIONS, categoryOf, initials, normalize } from './categories'

describe('normalize', () => {
  it('lowercases and strips Greek and Latin accents', () => {
    expect(normalize('Αθήνα')).toBe('αθηνα')
    expect(normalize('Οδοντίατρος')).toBe('οδοντιατρος')
    expect(normalize('Café')).toBe('cafe')
  })
})

describe('categoryOf', () => {
  it('matches specialties in English and Greek', () => {
    expect(categoryOf('Dentist')?.key).toBe('dentist')
    expect(categoryOf('Οδοντίατρος')?.key).toBe('dentist')
    expect(categoryOf('Παθολόγος')?.key).toBe('doctor')
    expect(categoryOf('personal trainer')?.key).toBe('fitness')
  })

  it('keeps look-alike words in the right category', () => {
    // "κτηνίατρος" contains "ιατρ" like the doctor words, and "orthodontist" starts like "orthopedic"
    expect(categoryOf('Κτηνίατρος')?.key).toBe('vet')
    expect(categoryOf('Orthodontist')?.key).toBe('dentist')
  })

  it('returns nothing for empty or unknown specialties', () => {
    expect(categoryOf(null)).toBeUndefined()
    expect(categoryOf('')).toBeUndefined()
    expect(categoryOf('Astronaut')).toBeUndefined()
  })

  it.each([...SPECIALTY_SUGGESTIONS.en, ...SPECIALTY_SUGGESTIONS.el])('puts the suggested specialty "%s" in a category', s => {
    expect(categoryOf(s)).toBeDefined()
  })
})

describe('initials', () => {
  it('takes the first letter of the first two names', () => {
    expect(initials('Maria Papadopoulou')).toBe('MP')
    expect(initials('  edis   bantak  ')).toBe('EB')
    expect(initials('Cher')).toBe('C')
  })

  it('falls back to a question mark', () => {
    expect(initials('')).toBe('?')
    expect(initials(null)).toBe('?')
  })
})
