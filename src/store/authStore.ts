import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { AuthUser } from '../types'

interface AuthState {
  user:      AuthUser | null
  isLoading: boolean
  error:     string | null
  init:        () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail:     (email: string, password: string) => Promise<void>
  signOut:         () => Promise<void>
  clearError:      () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:      null,
  isLoading: false,
  error:     null,

  init: async () => {
    if (!isSupabaseConfigured || !supabase) return
    set({ isLoading: true })
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, isLoading: false })
    supabase.auth.onAuthStateChange((_ev, session) => {
      set({ user: session?.user ?? null })
    })
  },

  signInEmail: async (email, password) => {
    if (!supabase) return
    set({ isLoading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) set({ error: error.message })
    set({ isLoading: false })
  },

  signUpEmail: async (email, password) => {
    if (!supabase) return
    set({ isLoading: true, error: null })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect back to whichever URL the app is running on (works for
        // both localhost and the GitHub Pages deployment automatically)
        // import.meta.env.BASE_URL is set at build time by Vite from vite.config base
        // → "/GermanCards/" on GitHub Pages, "/" locally — always correct
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
    if (error) set({ error: error.message })
    else set({ error: 'Bestätigungs-E-Mail gesendet! Bitte prüfe deinen Posteingang.' })
    set({ isLoading: false })
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
