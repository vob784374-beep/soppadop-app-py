import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui'

export default function ApiDocsPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('apiDocs.title')}</h1>
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
