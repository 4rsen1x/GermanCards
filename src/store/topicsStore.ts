import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { storage } from '../lib/storage'
import { DEFAULT_COLUMNS } from '../lib/constants'
import type { Topic, Column } from '../types'

interface TopicsState {
  topics:          Topic[]
  currentId:       string | null
  isLoading:       boolean
  isSaving:        boolean
  dirtyIds:        Set<string>
  isOnline:        boolean
  channel:         RealtimeChannel | null

  load:              (userId: string) => Promise<void>
  create:            (title: string, userId: string) => Promise<Topic>
  update:            (id: string, patch: Partial<Topic>) => void
  updateColumn:      (topicId: string, columnId: string, content: string) => void
  addColumn:         (topicId: string, col: Column) => void
  removeColumn:      (topicId: string, columnId: string) => void
  remove:            (id: string) => Promise<void>
  save:              (id: string) => Promise<void>
  saveAllDirty:      () => Promise<void>
  setCurrentId:      (id: string | null) => void
  subscribeRealtime: (userId: string) => void
  unsubscribe:       () => void
  setOnline:         (v: boolean) => void
}

export const useTopicsStore = create<TopicsState>((set, get) => ({
  topics:    [],
  currentId: null,
  isLoading: false,
  isSaving:  false,
  dirtyIds:  new Set(),
  isOnline:  navigator.onLine,
  channel:   null,

  load: async (userId) => {
    set({ isLoading: true })
    // Fast local load first
    const cached = storage.getTopics().filter(t => t.user_id === userId)
    if (cached.length) set({ topics: cached })

    if (isSupabaseConfigured && supabase && navigator.onLine) {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      if (!error && data) {
        set({ topics: data as Topic[] })
        storage.saveTopics(data as Topic[])
      }
    }
    set({ isLoading: false })
  },

  create: async (title, userId) => {
    const topic: Topic = {
      id:          crypto.randomUUID(),
      user_id:     userId,
      title,
      description: '',
      is_public:   false,
      columns:     DEFAULT_COLUMNS.map(c => ({ ...c })),
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    }

    set(s => ({ topics: [topic, ...s.topics], currentId: topic.id }))
    storage.saveTopics(get().topics)

    if (isSupabaseConfigured && supabase && navigator.onLine) {
      const { error } = await supabase.from('topics').insert({
        id: topic.id, user_id: userId, title,
        is_public: false, columns: topic.columns,
      })
      if (error) {
        const ids = new Set(get().dirtyIds); ids.add(topic.id)
        set({ dirtyIds: ids }); storage.saveDirtyIds(ids)
      }
    } else {
      const ids = new Set(get().dirtyIds); ids.add(topic.id)
      set({ dirtyIds: ids }); storage.saveDirtyIds(ids)
    }

    return topic
  },

  update: (id, patch) => {
    set(s => {
      const ids    = new Set(s.dirtyIds); ids.add(id)
      const topics = s.topics.map(t =>
        t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
      )
      storage.saveTopics(topics); storage.saveDirtyIds(ids)
      return { topics, dirtyIds: ids }
    })
  },

  updateColumn: (topicId, columnId, content) => {
    set(s => {
      const ids    = new Set(s.dirtyIds); ids.add(topicId)
      const topics = s.topics.map(t => {
        if (t.id !== topicId) return t
        const columns = t.columns.map(c => c.id === columnId ? { ...c, content } : c)
        return { ...t, columns, updated_at: new Date().toISOString() }
      })
      storage.saveTopics(topics); storage.saveDirtyIds(ids)
      return { topics, dirtyIds: ids }
    })
  },

  addColumn: (topicId, col) => {
    set(s => {
      const ids    = new Set(s.dirtyIds); ids.add(topicId)
      const topics = s.topics.map(t => {
        if (t.id !== topicId) return t
        return { ...t, columns: [...t.columns, col], updated_at: new Date().toISOString() }
      })
      storage.saveTopics(topics); storage.saveDirtyIds(ids)
      return { topics, dirtyIds: ids }
    })
  },

  removeColumn: (topicId, columnId) => {
    set(s => {
      const ids    = new Set(s.dirtyIds); ids.add(topicId)
      const topics = s.topics.map(t => {
        if (t.id !== topicId) return t
        return { ...t, columns: t.columns.filter(c => c.id !== columnId), updated_at: new Date().toISOString() }
      })
      storage.saveTopics(topics); storage.saveDirtyIds(ids)
      return { topics, dirtyIds: ids }
    })
  },

  remove: async (id) => {
    set(s => ({
      topics:    s.topics.filter(t => t.id !== id),
      currentId: s.currentId === id ? null : s.currentId,
    }))
    storage.saveTopics(get().topics)
    if (isSupabaseConfigured && supabase) {
      await supabase.from('topics').delete().eq('id', id)
    }
  },

  save: async (id) => {
    const topic = get().topics.find(t => t.id === id)
    if (!topic || !isSupabaseConfigured || !supabase) return

    set({ isSaving: true })
    const { error } = await supabase.from('topics').upsert({
      id: topic.id, user_id: topic.user_id,
      title: topic.title, description: topic.description,
      is_public: topic.is_public, columns: topic.columns,
      updated_at: topic.updated_at,
    })
    if (!error) {
      const ids = new Set(get().dirtyIds); ids.delete(id)
      set({ dirtyIds: ids }); storage.saveDirtyIds(ids)
    }
    set({ isSaving: false })
  },

  saveAllDirty: async () => {
    const { dirtyIds, isOnline } = get()
    if (!dirtyIds.size || !isOnline || !isSupabaseConfigured) return
    set({ isSaving: true })
    for (const id of [...dirtyIds]) await get().save(id)
    set({ isSaving: false })
  },

  setCurrentId: (id) => set({ currentId: id }),

  subscribeRealtime: (userId) => {
    if (!isSupabaseConfigured || !supabase) return
    get().unsubscribe()
    const ch = supabase
      .channel('gc_topics')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'topics', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set(s => {
              if (s.topics.some(t => t.id === (payload.new as Topic).id)) return s
              return { topics: [payload.new as Topic, ...s.topics] }
            })
          } else if (payload.eventType === 'UPDATE') {
            set(s => ({
              topics: s.topics.map(t =>
                t.id === (payload.new as Topic).id ? { ...t, ...(payload.new as Topic) } : t
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            set(s => ({
              topics:    s.topics.filter(t => t.id !== (payload.old as Partial<Topic>).id),
              currentId: s.currentId === (payload.old as Partial<Topic>).id ? null : s.currentId,
            }))
          }
        }
      )
      .subscribe()
    set({ channel: ch })
  },

  unsubscribe: () => {
    const { channel } = get()
    if (channel) { channel.unsubscribe(); set({ channel: null }) }
  },

  setOnline: (v) => set({ isOnline: v }),
}))
