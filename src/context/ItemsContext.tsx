import { createContext, useContext, useState, ReactNode } from 'react'
import { Item } from '../types'
import { mockItems } from '../mockData'

interface ItemsContextType {
  items: Item[]
  updateItem: (id: string, updatedItem: Partial<Item>) => void
  getItemById: (id: string) => Item | undefined
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(mockItems)

  const updateItem = (id: string, updatedItem: Partial<Item>) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, ...updatedItem, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    )
  }

  const getItemById = (id: string) => {
    return items.find(item => item.id === id)
  }

  return (
    <ItemsContext.Provider value={{ items, updateItem, getItemById }}>
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems() {
  const context = useContext(ItemsContext)
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider')
  }
  return context
}
