import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LearningSlice, createLearningSlice } from '@/context'
import { loadProgress } from '@/utils/helpers/learning'

type Store = LearningSlice

export const useBoundStore = create(
  persist<Store>(
    (...a) => ({
      ...createLearningSlice(...a),
    }),
    {
      name: 'bkl_settings',
      partialize: (state) => ({ username: state.username, studentToken: state.studentToken }) as Store,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.username) {
          state.progress = loadProgress(state.username)
        }
      },
    },
  ),
)
