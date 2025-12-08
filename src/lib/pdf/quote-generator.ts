import jsPDF from 'jspdf'

// Helper function to convert image URL to base64 (server-side compatible)
async function getImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'

    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error converting image to base64:', error)
    return null
  }
}

interface QuoteItem {
  id: string
  customDescription?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: 'product' | 'service' | 'custom'
}

interface QuoteData {
  id: string
  quoteNumber?: string
  projectId?: string
  customerId?: string
  items: QuoteItem[]
  subtotal: number
  markup: number
  tax: number
  total: number
  validUntil: string
  createdAt: string
  notes?: string
  terms?: string
  createdBy?: string
  designImageUrl?: string
  designStyle?: string
}

export async function generateQuotePDF(quote: QuoteData): Promise<jsPDF> {
  console.log('PDF Generation started for quote:', quote.id)
  console.log('Quote keys:', Object.keys(quote))
  console.log('Quote items exist:', !!quote.items, 'Count:', quote.items?.length || 0)

  const doc = new jsPDF()

  // Company header
  doc.setFontSize(20)
  doc.setTextColor(39, 60, 44) // Brand green #273C2C
  doc.text('Landscapered', 20, 25)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Professional Garden Design & Landscaping', 20, 35)

  // Add company contact info
  doc.setFontSize(10)
  doc.text('Email: hello@landscapered.com | Phone: +44 20 1234 5678', 20, 45)
  doc.text('www.landscapered.com', 20, 52)

  // Quote title and details
  doc.setFontSize(16)
  doc.setTextColor(39, 60, 44)
  doc.text('GARDEN DESIGN QUOTE', 20, 70)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  // Quote details in two columns
  const leftColumn = 20
  const rightColumn = 120
  let yPos = 85

  doc.text(`Quote Number: ${quote.quoteNumber || quote.id}`, leftColumn, yPos)
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-GB')}`, rightColumn, yPos)

  yPos += 7
  doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString('en-GB')}`, leftColumn, yPos)

  if (quote.createdBy) {
    doc.text(`Created By: ${quote.createdBy}`, rightColumn, yPos)
  }

  // Notes section
  if (quote.notes) {
    yPos += 15
    doc.setFontSize(12)
    doc.setTextColor(39, 60, 44)
    doc.text('PROJECT NOTES', leftColumn, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(quote.notes, leftColumn, yPos, { maxWidth: 170 })
    yPos += 10
  }

  // AI Design Image section
  if (quote.designImageUrl) {
    yPos += 15
    doc.setFontSize(12)
    doc.setTextColor(39, 60, 44)
    doc.text('AI GENERATED DESIGN', leftColumn, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    if (quote.designStyle) {
      doc.text(`Style: ${quote.designStyle}`, leftColumn, yPos)
      yPos += 7
    }

    // Try to fetch and include the actual image
    try {
      const imageBase64 = await getImageAsBase64(quote.designImageUrl)

      if (imageBase64) {
        // Standard dimensions for garden design images in PDF
        // Most AI images are square (1:1) or landscape (16:9 or 4:3)
        const targetWidth = 140   // Good size for viewing details
        const targetHeight = 90   // 14:9 ratio works well for most designs

        // Determine image format from MIME type
        const imageFormat = imageBase64.includes('data:image/png') ? 'PNG' : 'JPEG'

        // Add the image to PDF - jsPDF will handle aspect ratio automatically if needed
        doc.addImage(imageBase64, imageFormat, leftColumn, yPos, targetWidth, targetHeight)
        yPos += targetHeight + 15  // Good spacing after image
      } else {
        // Fallback if image fetch fails
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text('Design preview: View in digital quote', leftColumn, yPos)
        yPos += 15
      }
    } catch (error) {
      // Fallback if anything fails
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('Design image could not be embedded', leftColumn, yPos)
      yPos += 15
    }
  }

  // Items table
  yPos += 20
  doc.setFontSize(12)
  doc.setTextColor(39, 60, 44)
  doc.text('QUOTE ITEMS', leftColumn, yPos)

  // Manual table creation instead of autoTable
  yPos += 15
  const tableStartY = yPos
  const tableWidth = 170
  const colWidths = [60, 20, 30, 30, 30]
  const colStartX = [leftColumn, leftColumn + 60, leftColumn + 80, leftColumn + 110, leftColumn + 140]
  const rowHeight = 8

  // Table header
  doc.setFillColor(39, 60, 44)
  doc.rect(leftColumn, yPos, tableWidth, rowHeight, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  const headers = ['Description', 'Qty', 'Unit Price', 'Total', 'Type']
  headers.forEach((header, i) => {
    doc.text(header, colStartX[i] + 2, yPos + 6)
  })

  yPos += rowHeight

  // Table body
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Add defensive check for items
  const items = quote.items || []
  console.log('PDF Generation - Items found:', items.length)
  console.log('PDF Generation - Sample item:', items[0] || 'No items')
  console.log('PDF Generation - Full quote object:', JSON.stringify(quote, null, 2))

  items.forEach((item, index) => {
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
    const description = item.customDescription || 'Item'
    const rowData = [
      description.length > 30 ? description.substring(0, 30) + '...' : description,
      (item.quantity || 0).toString(),
      `£${(item.unitPrice || 0).toFixed(2)}`,
      `£${(item.totalPrice || 0).toFixed(2)}`,
      (item.category || 'product').charAt(0).toUpperCase() + (item.category || 'product').slice(1)
    ]

    rowData.forEach((data, i) => {
      doc.text(data, colStartX[i] + 2, rowY + 6)
    })
  })

  const finalY = yPos + (items.length * rowHeight)

  // Pricing summary
  const summaryStartY = finalY + 20
  const summaryX = 130

  doc.setFontSize(10)
  let currentY = summaryStartY

  // Subtotal
  doc.text('Subtotal:', summaryX, currentY)
  doc.text(`£${quote.subtotal.toFixed(2)}`, summaryX + 30, currentY, { align: 'right' })
  currentY += 7

  // Markup (if any)
  if (quote.markup > 0) {
    doc.text('Markup:', summaryX, currentY)
    doc.text(`£${quote.markup.toFixed(2)}`, summaryX + 30, currentY, { align: 'right' })
    currentY += 7
  }

  // VAT
  doc.text('VAT (20%):', summaryX, currentY)
  doc.text(`£${quote.tax.toFixed(2)}`, summaryX + 30, currentY, { align: 'right' })
  currentY += 7

  // Draw line above total
  doc.setLineWidth(0.5)
  doc.line(summaryX, currentY + 2, summaryX + 30, currentY + 2)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', summaryX, currentY + 10)
  doc.text(`£${quote.total.toFixed(2)}`, summaryX + 30, currentY + 10, { align: 'right' })

  // Footer with terms
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)

  const footerText = [
    quote.terms || 'Payment due within 30 days of acceptance.',
    'This quote is valid until the date specified above.',
    'All prices are in GBP and include VAT where applicable.',
    'Thank you for considering Landscapered for your garden design needs!'
  ]

  footerText.forEach((line, index) => {
    doc.text(line, 20, pageHeight - 40 + (index * 5))
  })

  return doc
}

export async function downloadQuotePDF(quote: QuoteData) {
  const doc = await generateQuotePDF(quote)
  const filename = `quote-${quote.quoteNumber || quote.id}.pdf`
  doc.save(filename)
}