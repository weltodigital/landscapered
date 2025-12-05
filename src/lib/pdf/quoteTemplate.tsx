import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5016',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  tableCol: {
    flex: 1,
    textAlign: 'left',
  },
  tableColRight: {
    flex: 1,
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#2d5016',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
    minWidth: 80,
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  estimate: {
    backgroundColor: '#fff3cd',
    padding: 10,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  estimateText: {
    fontSize: 10,
    color: '#856404',
  },
})

interface QuoteData {
  id: string
  project: {
    title: string
    clientName: string
    clientEmail: string
  }
  designConcept: {
    style: string
  }
  organisation?: {
    name: string
  }
  subtotal: number
  profit: number
  total: number
  lowEstimate: number
  highEstimate: number
  currency: string
  createdAt: string
  lineItems: Array<{
    description: string
    quantityNumeric: number
    unit: string
    unitPrice: number
    lineTotal: number
  }>
}

interface QuotePDFProps {
  quote: QuoteData
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Garden Design Quote</Text>
        <Text style={styles.subtitle}>
          {quote.organisation?.name || 'Gardenly Design Services'}
        </Text>
        <Text style={styles.subtitle}>
          Quote #{quote.id.slice(-8).toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>
          Date: {new Date(quote.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Project Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <View style={styles.row}>
          <Text>Project:</Text>
          <Text>{quote.project.title}</Text>
        </View>
        <View style={styles.row}>
          <Text>Client:</Text>
          <Text>{quote.project.clientName}</Text>
        </View>
        <View style={styles.row}>
          <Text>Email:</Text>
          <Text>{quote.project.clientEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text>Design Style:</Text>
          <Text>{quote.designConcept.style}</Text>
        </View>
      </View>

      {/* Quote Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quote Details</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 3 }]}>Description</Text>
          <Text style={styles.tableCol}>Quantity</Text>
          <Text style={styles.tableCol}>Unit</Text>
          <Text style={styles.tableColRight}>Unit Price</Text>
          <Text style={styles.tableColRight}>Total</Text>
        </View>

        {/* Table Rows */}
        {quote.lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 3 }]}>{item.description}</Text>
            <Text style={styles.tableCol}>
              {item.quantityNumeric % 1 === 0
                ? item.quantityNumeric.toString()
                : item.quantityNumeric.toFixed(1)
              }
            </Text>
            <Text style={styles.tableCol}>{item.unit}</Text>
            <Text style={styles.tableColRight}>
              £{item.unitPrice.toFixed(2)}
            </Text>
            <Text style={styles.tableColRight}>
              £{item.lineTotal.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>£{quote.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Profit Margin:</Text>
          <Text style={styles.totalValue}>£{quote.profit.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
          <Text style={[styles.totalValue, styles.grandTotal]}>
            £{quote.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Estimate Range */}
      <View style={styles.estimate}>
        <Text style={styles.estimateText}>
          <Text style={{ fontWeight: 'bold' }}>Estimate Range: </Text>
          This quote represents our best estimate. The final cost may range from £
          {quote.lowEstimate.toFixed(2)} to £{quote.highEstimate.toFixed(2)} depending on
          site conditions, material availability, and any additional requirements discovered
          during the project.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          This quote is valid for 30 days from the date of issue. All prices include materials and labor.
          Additional charges may apply for site preparation, permits, or unforeseen complications.
        </Text>
        <Text style={{ marginTop: 5 }}>
          Generated by Gardenly - AI-Powered Garden Design & Quoting Platform
        </Text>
      </View>
    </Page>
  </Document>
)

// Export function to generate PDF buffer
export async function generateQuotePDF(quote: QuoteData): Promise<Buffer> {
  const { pdf } = await import('@react-pdf/renderer')
  const buffer = await pdf(<QuotePDF quote={quote} />).toBuffer()
  return buffer
}