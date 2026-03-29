import { useState, useEffect } from 'react'
import { Button, Card } from '@/components/ui'
import { apiClient } from '@/api'

interface TestSuite {
  passed: number
  failed: number
  tests: { name: string; status: string }[]
}

interface TestReport {
  timestamp: string
  summary: {
    total: number
    passed: number
    failed: number
    errors: number
    pass_rate: number
    unit_total: number
    unit_passed: number
    automation_total: number
    automation_passed: number
  }
  coverage: {
    total_statements: number
    covered_statements: number
    coverage_percent: number
  }
  unit_suites: Record<string, TestSuite>
  automation_suites: Record<string, TestSuite>
  output: string
}

type TestMode = 'all' | 'unit' | 'automation'

export default function TestDashboardPage() {
  const [report, setReport] = useState<TestReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testMode, setTestMode] = useState<TestMode>('all')
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const resp = await apiClient.get('/test-report')
      setReport(resp.data)
    } catch {
      setReport(null)
    }
  }

  const runTests = async (mode: TestMode) => {
    setIsRunning(true)
    setTestMode(mode)
    try {
      const resp = await apiClient.post('/run-tests', { mode })
      setReport(resp.data)
    } catch {}
    setIsRunning(false)
  }

  const passRateColor = (rate: number) => {
    if (rate >= 90) return '#22c55e'
    if (rate >= 70) return '#eab308'
    return '#ef4444'
  }

  const coverageColor = (percent: number) => {
    if (percent >= 80) return '#22c55e'
    if (percent >= 60) return '#eab308'
    return '#ef4444'
  }

  const getSuites = () => {
    if (!report) return {}
    if (testMode === 'unit') return report.unit_suites || {}
    if (testMode === 'automation') return report.automation_suites || {}
    return { ...(report.unit_suites || {}), ...(report.automation_suites || {}) }
  }

  const suites = getSuites()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Test Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" onClick={loadReport}>Refresh</Button>
          <Button variant={testMode === 'all' ? 'primary' : 'ghost'} onClick={() => runTests('all')} loading={isRunning && testMode === 'all'}>
            Run All
          </Button>
          <Button variant={testMode === 'unit' ? 'primary' : 'ghost'} onClick={() => runTests('unit')} loading={isRunning && testMode === 'unit'}>
            Run Unit
          </Button>
          <Button variant={testMode === 'automation' ? 'success' : 'ghost'} onClick={() => runTests('automation')} loading={isRunning && testMode === 'automation'}>
            Run Automation
          </Button>
        </div>
      </div>

      {report ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Tests</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{report.summary.total}</div>
            </Card>
            <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Passed</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{report.summary.passed}</div>
            </Card>
            <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Failed</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{report.summary.failed}</div>
            </Card>
            <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pass Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: passRateColor(report.summary.pass_rate) }}>{report.summary.pass_rate}%</div>
            </Card>
            <Card style={{ flex: '1 1 120px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Coverage</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: coverageColor(report.coverage.coverage_percent) }}>{report.coverage.coverage_percent}%</div>
            </Card>
          </div>

          {/* Unit vs Automation Breakdown */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <Card style={{ flex: 1, padding: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.5rem' }}>Unit Tests</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Passed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{report.summary.unit_passed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{report.summary.unit_total}</div>
                </div>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '0.5rem' }}>
                <div style={{ background: '#3b82f6', borderRadius: '4px', height: '6px', width: `${report.summary.unit_total ? (report.summary.unit_passed / report.summary.unit_total * 100) : 0}%` }} />
              </div>
            </Card>
            <Card style={{ flex: 1, padding: '1rem', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e', marginBottom: '0.5rem' }}>Automation Tests</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Passed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{report.summary.automation_passed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{report.summary.automation_total}</div>
                </div>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '0.5rem' }}>
                <div style={{ background: '#22c55e', borderRadius: '4px', height: '6px', width: `${report.summary.automation_total ? (report.summary.automation_passed / report.summary.automation_total * 100) : 0}%` }} />
              </div>
            </Card>
          </div>

          {/* Progress Bars */}
          <Card style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Pass Rate</span><span>{report.summary.pass_rate}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div style={{ background: passRateColor(report.summary.pass_rate), borderRadius: '4px', height: '8px', width: `${report.summary.pass_rate}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Code Coverage</span><span>{report.coverage.coverage_percent}%</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div style={{ background: coverageColor(report.coverage.coverage_percent), borderRadius: '4px', height: '8px', width: `${report.coverage.coverage_percent}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          </Card>

          {/* Test Suites & Details */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '250px', flexShrink: 0 }}>
              <Card style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Test Suites</div>
                {report.unit_suites && Object.keys(report.unit_suites).length > 0 && (
                  <>
                    <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 600, margin: '0.5rem 0 0.25rem', textTransform: 'uppercase' }}>Unit Tests</div>
                    {Object.entries(report.unit_suites).map(([name, suite]) => (
                      <div key={`unit-${name}`} onClick={() => { setSelectedSuite(`unit-${name}`); setTestMode('unit') }}
                        style={{ padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginBottom: '0.25rem', background: selectedSuite === `unit-${name}` ? '#eff6ff' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>{name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                          <span style={{ color: '#22c55e' }}>{suite.passed}</span>
                          {suite.failed > 0 && <span style={{ color: '#ef4444' }}>{suite.failed}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {report.automation_suites && Object.keys(report.automation_suites).length > 0 && (
                  <>
                    <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600, margin: '0.75rem 0 0.25rem', textTransform: 'uppercase' }}>Automation Tests</div>
                    {Object.entries(report.automation_suites).map(([name, suite]) => (
                      <div key={`auto-${name}`} onClick={() => { setSelectedSuite(`auto-${name}`); setTestMode('automation') }}
                        style={{ padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginBottom: '0.25rem', background: selectedSuite === `auto-${name}` ? '#f0fdf4' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>{name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                          <span style={{ color: '#22c55e' }}>{suite.passed}</span>
                          {suite.failed > 0 && <span style={{ color: '#ef4444' }}>{suite.failed}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            </div>

            <div style={{ flex: 1 }}>
              <Card style={{ padding: '1rem' }}>
                {selectedSuite ? (
                  <>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{selectedSuite.replace('unit-', '').replace('auto-', '')} Tests</div>
                    {(suites[selectedSuite.replace('unit-', '').replace('auto-', '')] || suites[selectedSuite])?.tests?.map((test, i) => (
                      <div key={i} style={{ padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem', background: test.status === 'passed' ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>{test.name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: test.status === 'passed' ? '#22c55e' : '#ef4444', padding: '0.125rem 0.5rem', borderRadius: '4px', background: test.status === 'passed' ? '#dcfce7' : '#fee2e2' }}>
                          {test.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>Select a test suite to view details</div>
                )}
              </Card>

              <Card style={{ padding: '1rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>Test Output</div>
                <pre style={{ fontSize: '0.7rem', background: '#1e293b', color: '#e2e8f0', padding: '1rem', borderRadius: '4px', overflow: 'auto', maxHeight: '400px', whiteSpace: 'pre-wrap' }}>
                  {report.output || 'No output available'}
                </pre>
              </Card>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem', textAlign: 'right' }}>Last run: {report.timestamp}</div>
        </>
      ) : (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Test Report</div>
          <div style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Run tests to generate a report</div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => runTests('unit')} loading={isRunning && testMode === 'unit'}>Run Unit Tests</Button>
            <Button variant="success" onClick={() => runTests('automation')} loading={isRunning && testMode === 'automation'}>Run Automation Tests</Button>
            <Button variant="ghost" onClick={() => runTests('all')} loading={isRunning && testMode === 'all'}>Run All</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
