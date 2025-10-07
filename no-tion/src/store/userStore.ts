import { User } from '@/lib/user'
import { create } from 'zustand'

interface UserStore {
  user: User
  isLogged: boolean
  setUser: (user: User) => void
  setIsLogged: (isLogged: boolean) => void
}

export const userStore = create<UserStore>(set => {
  const isLogged = false

  const user: User = {
    email: '',
    access_token: ''
  }

  const setUser = (user: User) => {
    set({ user })
  }

  const setIsLogged = (isLogged: boolean) => {
    set({ isLogged })
  }

  return {
    user,
    isLogged,
    setUser,
    setIsLogged
  }
})
