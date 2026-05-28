import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  name: string
  avatar: string
  email: string
  phone: string
  department: string
  position: string
  bio: string
}

interface UserContextType {
  user: User
  updateUser: (updatedUser: Partial<User>) => void
}

const defaultUser: User = {
  name: '开心的助理',
  avatar: '😊',
  email: 'assistant@example.com',
  phone: '138-0000-0000',
  department: '产品研发部',
  position: '产品经理',
  bio: '热爱产品，喜欢创新，致力于打造优秀的产品体验。'
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser)

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUser }))
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
