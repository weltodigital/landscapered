// Shared in-memory quote storage (in production, this would be a database)
export const quotes: any[] = []

export function addQuote(quote: any) {
  quotes.push(quote)
  return quote
}

export function getQuote(quoteId: string, userId?: string) {
  return quotes.find(q => q.id === quoteId && (userId ? q.userId === userId : true))
}

export function getQuotesByProject(projectId: string, userId: string) {
  return quotes.filter(q => q.userId === userId && q.projectId === projectId)
}

export function getAllQuotes() {
  return [...quotes]
}