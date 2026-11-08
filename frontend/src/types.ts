// Shapes of the backend's JSON responses

export type Role = 'ROLE_CLIENT' | 'ROLE_PROVIDER'
export type AppointmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export type Provider = {
  userId: number
  fullName: string
  specialty: string | null
  bio: string | null
  address: string | null
  pricePerVisit: number | null
}

export type Party = { id: number; fullName: string; email: string; phone: string | null }

export type Appointment = {
  id: number
  appointmentDate: string
  status: AppointmentStatus
  notes: string | null
  client: Party
  provider: Party
}

export type Me = { id: number; username: string; email: string; fullName: string; phone: string | null; role: Role }
export type ProfileResponse = { user: Me; profile: Provider | null }

// The JWT itself is in an HttpOnly cookie, not in this body
export type AuthResponse = { role: Role; userId: number; fullName: string }

// Pushed live when an appointment is created or its status changes; changedBy = who did it
export type AppointmentEvent = { appointment: Appointment; changedBy: number }

export type ChatMessage = { id: number; senderId: number; receiverId: number; content: string; createdAt: string; readAt: string | null }

export type Contact = {
  userId: number
  fullName: string
  role: Role
  specialty: string | null
  lastMessage: string | null
  lastAt: string | null
  lastFromMe: boolean
  unread: number
}
