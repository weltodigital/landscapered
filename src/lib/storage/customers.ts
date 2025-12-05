import { Customer } from '@/types/crm'

// In-memory storage for customers (in production, this would be a database)
export const customers: Customer[] = []

export function addCustomer(customer: Customer): Customer {
  customers.push(customer)
  return customer
}

export function getCustomer(customerId: string, userId?: string): Customer | undefined {
  return customers.find(c => c.id === customerId && (userId ? c.userId === userId : true))
}

export function getCustomerByEmail(email: string, userId: string): Customer | undefined {
  return customers.find(c => c.email.toLowerCase() === email.toLowerCase() && c.userId === userId)
}

export function getAllCustomers(userId: string): Customer[] {
  return customers.filter(c => c.userId === userId)
}

export function updateCustomer(customerId: string, userId: string, updates: Partial<Customer>): Customer | null {
  const customerIndex = customers.findIndex(c => c.id === customerId && c.userId === userId)
  if (customerIndex === -1) return null

  customers[customerIndex] = { ...customers[customerIndex], ...updates, updatedAt: new Date().toISOString() }
  return customers[customerIndex]
}

export function deleteCustomer(customerId: string, userId: string): boolean {
  const customerIndex = customers.findIndex(c => c.id === customerId && c.userId === userId)
  if (customerIndex === -1) return false

  customers.splice(customerIndex, 1)
  return true
}

export function searchCustomers(query: string, userId: string): Customer[] {
  const lowerQuery = query.toLowerCase()
  return customers.filter(c =>
    c.userId === userId && (
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone?.toLowerCase().includes(lowerQuery) ||
      c.city?.toLowerCase().includes(lowerQuery) ||
      c.postcode?.toLowerCase().includes(lowerQuery)
    )
  )
}