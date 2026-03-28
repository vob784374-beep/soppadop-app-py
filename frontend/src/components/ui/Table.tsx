import React from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: string
  loading?: boolean
  emptyText?: string
}

export default function Table<T extends Record<string, any>>({ columns, data, rowKey, loading, emptyText = 'No data' }: TableProps<T>) {
  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</div>

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={{
              textAlign: 'left' as const, padding: '0.75rem', borderBottom: '2px solid #e5e7eb',
              fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, width: col.width,
            }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>{emptyText}</td></tr>
        )}
        {data.map(item => (
          <tr key={item[rowKey]} style={{ borderBottom: '1px solid #e5e7eb' }}>
            {columns.map(col => (
              <td key={col.key} style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                {col.render ? col.render(item) : item[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
