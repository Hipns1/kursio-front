import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LearningSlice, createLearningSlice } from '@/context'
import { loadProgress } from '@/utils/helpers/learning'

type Store = LearningSlice

export const useBoundStore = create(
  persist<Store>(
    (...a) => ({
      ...createLearningSlice(...a)
    }),
    {
      name: 'bkl_settings',
      onRehydrateStorage: () => (state) => {
        if (state?.username) {
          state.progress = loadProgress(state.username)
        }
      },
      partialize: (state) => ({ studentToken: state.studentToken, username: state.username }) as Store,
      storage: createJSONStorage(() => localStorage)
    }
  )
)
