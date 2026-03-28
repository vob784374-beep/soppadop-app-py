import { Card } from '@/components/ui'

export default function ApiDocsPage() {
  return (
    <div>
      <h1>API Documentation</h1>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <iframe
          src="/api/docs"
          title="Swagger UI"
          style={{
            width: '100%',
            height: 'calc(100vh - 200px)',
            border: 'none',
          }}
        />
      </Card>
    </div>
  )
}
