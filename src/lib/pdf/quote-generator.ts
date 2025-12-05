import jsPDF from 'jspdf'

interface QuoteElement {
  id: string
  name: string
  description: string
  type: string
  area: number
  unit: string
  unitPrice: number
  totalPrice: number
}

interface QuoteData {
  id: string
  projectId: string
  elements: QuoteElement[]
  pricing: {
    subtotal: number
    vatRate: number
    vatAmount: number
    total: number
  }
  validUntil: string
  createdAt: string
  clientDetails?: {
    name: string
    email: string
    projectTitle: string
  }
}

export function generateQuotePDF(quote: QuoteData): jsPDF {
  const doc = new jsPDF()

  // Company header
  doc.setFontSize(20)
  doc.setTextColor(0, 100, 0) // Green color
  doc.text('Gardenly', 20, 25)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Professional Garden Design & Landscaping', 20, 35)

  // Add company contact info
  doc.setFontSize(10)
  doc.text('Email: hello@gardenly.com | Phone: +44 20 1234 5678', 20, 45)
  doc.text('www.gardenly.com', 20, 52)

  // Quote title and details
  doc.setFontSize(16)
  doc.setTextColor(0, 100, 0)
  doc.text('GARDEN DESIGN QUOTE', 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  // Quote details in two columns
  const leftColumn = 20
  const rightColumn = 120
  let yPos = 85

  doc.text(`Quote ID: ${quote.id}`, leftColumn, yPos)
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-GB')}`, rightColumn, yPos)

  yPos += 7
  doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString('en-GB')}`, leftColumn, yPos)

  // Client details
  if (quote.clientDetails) {
    yPos += 15
    doc.setFontSize(12)
    doc.setTextColor(0, 100, 0)
    doc.text('CLIENT DETAILS', leftColumn, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Project: ${quote.clientDetails.projectTitle}`, leftColumn, yPos)
    yPos += 7
    doc.text(`Client: ${quote.clientDetails.name}`, leftColumn, yPos)
    yPos += 7
    doc.text(`Email: ${quote.clientDetails.email}`, leftColumn, yPos)
  }

  // Elements table
  yPos += 20
  doc.setFontSize(12)
  doc.setTextColor(0, 100, 0)
  doc.text('QUOTED ELEMENTS', leftColumn, yPos)

  // Manual table creation instead of autoTable
  yPos += 15
  const tableStartY = yPos
  const tableWidth = 170
  const colWidths = [35, 55, 20, 25, 25]
  const colStartX = [leftColumn, leftColumn + 35, leftColumn + 90, leftColumn + 110, leftColumn + 135]
  const rowHeight = 8

  // Table header
  doc.setFillColor(0, 100, 0)
  doc.rect(leftColumn, yPos, tableWidth, rowHeight, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  const headers = ['Item', 'Description', 'Quantity', 'Unit Price', 'Total']
  headers.forEach((header, i) => {
    doc.text(header, colStartX[i] + 2, yPos + 6)
  })

  yPos += rowHeight

  // Table body
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  quote.elements.forEach((element, index) => {
    const rowY = yPos + (index * rowHeight)

    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 245)
      doc.rect(leftColumn, rowY, tableWidth, rowHeight, 'F')
    }

    // Cell borders
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.1)
    colWidths.forEach((width, i) => {
      doc.rect(colStartX[i], rowY, width, rowHeight, 'S')
    })

    // Cell content
    const rowData = [
      element.name,
      element.description.length > 25 ? element.description.substring(0, 25) + '...' : element.description,
      `${element.area} ${element.unit}`,
      `£${element.unitPrice.toFixed(2)}`,
      `£${element.totalPrice.toFixed(2)}`
    ]

    rowData.forEach((data, i) => {
      doc.text(data, colStartX[i] + 2, rowY + 6)
    })
  })

  const finalY = yPos + (quote.elements.length * rowHeight)

  // Pricing summary
  const summaryStartY = finalY + 20
  const summaryX = 130

  doc.setFontSize(10)
  doc.text('Subtotal:', summaryX, summaryStartY)
  doc.text(`£${quote.pricing.subtotal.toFixed(2)}`, summaryX + 30, summaryStartY, { align: 'right' })

  doc.text(`VAT (${(quote.pricing.vatRate * 100).toFixed(0)}%):`, summaryX, summaryStartY + 7)
  doc.text(`£${quote.pricing.vatAmount.toFixed(2)}`, summaryX + 30, summaryStartY + 7, { align: 'right' })

  // Draw line above total
  doc.setLineWidth(0.5)
  doc.line(summaryX, summaryStartY + 12, summaryX + 30, summaryStartY + 12)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', summaryX, summaryStartY + 20)
  doc.text(`£${quote.pricing.total.toFixed(2)}`, summaryX + 30, summaryStartY + 20, { align: 'right' })

  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)

  const footerText = [
    'This quote is valid for 30 days from the date of issue.',
    'All prices include materials and installation.',
    'Payment terms: 50% deposit, 50% on completion.',
    'Thank you for considering Gardenly for your garden design needs!'
  ]

  footerText.forEach((line, index) => {
    doc.text(line, 20, pageHeight - 40 + (index * 5))
  })

  return doc
}

export function downloadQuotePDF(quote: QuoteData) {
  const doc = generateQuotePDF(quote)
  const filename = `quote-${quote.id}-${quote.clientDetails?.name?.replace(/\s+/g, '-') || 'client'}.pdf`
  doc.save(filename)
}