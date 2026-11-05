import './jsx-loader.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { setLanguage } from '../src/utils/i18n.js'
import { newReceiptRequestId } from '../src/utils/billing.js'

const { FinancialSummary } = await import('../src/components/finance/FinancialSummary.jsx')
const { BillTable } = await import('../src/components/finance/BillTable.jsx')

test('financial summary distinguishes credit, debt and exact settlement in both interface languages', () => {
  for (const language of ['en', 'sw']) {
    setLanguage(language)
    for (const [net, colour, label] of [[40000, 'text-success', language === 'en' ? 'Credit available' : 'Salio la ziada'], [-6000000, 'text-danger', language === 'en' ? 'Amount owed' : 'Deni linalodaiwa'], [0, 'text-muted-foreground', language === 'en' ? 'Fully settled' : 'Amemaliza kulipa']]) {
      const html = renderToStaticMarkup(createElement(FinancialSummary, { summary: { total_invoiced: 6000000, total_paid: 6000000 + net, net_balance: net } }))
      assert.ok(html.includes(colour))
      assert.ok(html.includes(label))
      if (net > 0) assert.ok(html.includes('+'))
      if (net < 0) assert.ok(html.includes('-'))
    }
  }
  setLanguage('en')
})

test('billing report renders period, bill and payment identifiers without exposing raw markup', () => {
  const html = renderToStaticMarkup(createElement(BillTable, { showStudent: true, showPayments: true, invoices: [{ id: 1, invoice_number: 'INV-1', student: { full_name: '<Child>', student_number: 'ST-1' }, period: 'Term 2 2026', amount: 100, amount_paid: 40, balance: 60, due_date: '2026-06-30', status: 'partial', payment_ids: ['CTRL-1', 'CTRL-2'] }] }))
  for (const value of ['Bill ID', 'Period', 'Payment ID', 'Term 2 2026', 'CTRL-1, CTRL-2', '&lt;Child&gt;']) assert.ok(html.includes(value), value)
  assert.ok(!html.includes('<Child>'))
})

test('new cash receipt forms receive unique request identifiers for safe retries', () => {
  const ids = new Set(Array.from({ length: 50 }, () => newReceiptRequestId()))
  assert.equal(ids.size, 50)
  for (const id of ids) assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
})
