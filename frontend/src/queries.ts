import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Appointment, ChatMessage, Contact, ProfileResponse, Provider } from './types'

// Every piece of server data has one key, so any screen can read it and any event can refresh it
export const keys = {
  providers: ['providers'] as const,
  appointments: ['appointments'] as const,
  profile: ['profile'] as const,
  busy: ['busy'] as const,
  busyOn: (providerId: number, date: string) => ['busy', providerId, date] as const,
  contacts: ['contacts'] as const,
  thread: (peerId: number) => ['thread', peerId] as const,
}

export const useProviders = () =>
  useQuery({ queryKey: keys.providers, queryFn: () => api<Provider[]>('/api/providers') })

export const useAppointments = () =>
  useQuery({ queryKey: keys.appointments, queryFn: () => api<Appointment[]>('/api/appointments/mine') })

export const useProfile = () =>
  useQuery({ queryKey: keys.profile, queryFn: () => api<ProfileResponse>('/api/profile') })

// Times other clients already hold for this provider on the chosen day
export const useBusySlots = (providerId: number | undefined, date: string) =>
  useQuery({
    queryKey: keys.busyOn(providerId ?? 0, date),
    queryFn: () => api<string[]>(`/api/providers/${providerId}/busy?date=${date}`),
    enabled: providerId != null && !!date,
  })

export const useContacts = () =>
  useQuery({ queryKey: keys.contacts, queryFn: () => api<Contact[]>('/api/messages/contacts') })

// Loading a conversation also marks it read on the server
export const useThread = (peerId: number | null) =>
  useQuery({
    queryKey: keys.thread(peerId ?? 0),
    queryFn: () => api<ChatMessage[]>(`/api/messages/${peerId}`),
    enabled: peerId != null,
  })

export function useBookAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: { providerId: number; appointmentDate: string; notes: string }) =>
      api<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(req) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.appointments }),
    // Booked or refused (someone may have just taken the slot): the free times have changed either way
    onSettled: () => qc.invalidateQueries({ queryKey: keys.busy }),
  })
}

// Accept, decline or cancel
export function useSetAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api<Appointment>(`/api/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.appointments }),
  })
}

// A stable "no data" value: a fresh [] on every render would make memos and effects rerun each time
export const NONE: never[] = []
