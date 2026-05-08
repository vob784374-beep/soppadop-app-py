import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Badge, Table, Alert, Modal, Input } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import { abacApi } from '@/api'
import type { PolicyRule } from '@/types'
import './AbacPage.scss'

export default function AbacPage() {
  const { data: policiesData, loading, error } = useApi(() => abacApi.list())
  const [policies, setPolicies] = useState<PolicyRule[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<PolicyRule | null>(null)
  const toast = useToast()

  const [newRule, setNewRule] = useState<Partial<PolicyRule>>({
    name: '',
    description: '',
    priority: 50,
    effect: 'allow' as const,
    actions: ['*'],
    resources: ['*'],
    conditions: {},
    is_active: true
  })

  // Sync policies from API data
  useEffect(() => {
    if (policiesData?.policies) {
      setPolicies(policiesData.policies)
    }
  }, [policiesData])

  const { mutate: deleteRule } = useMutation(
    (id: number) => abacApi.delete(id),
    {
      onSuccess: (_, id: any) => {
        setPolicies(prev => prev.filter(p => p.id !== id))
        toast.show('Policy rule deleted', 'success')
      }
    }
  )

  const { mutate: createRule } = useMutation(
    () => abacApi.create(newRule as any),
    {
      onSuccess: (res) => {
        if (res?.policy) {
          setPolicies(prev => [...prev, res.policy])
        }
        toast.show('Policy rule created', 'success')
        setShowCreateModal(false)
        setNewRule({ name: '', description: '', priority: 50, effect: 'allow', actions: ['*'], resources: ['*'], conditions: {}, is_active: true })
      }
    }
  )

  const { mutate: updateRule } = useMutation(
    (p: { id: number; data: Partial<PolicyRule> }) => abacApi.update(p.id, p.data),
    {
      onSuccess: (res) => {
        if (res?.policy) {
          setPolicies(prev => prev.map(p => p.id === res.policy.id ? res.policy : p))
        }
        toast.show('Policy rule updated', 'success')
        setShowEditModal(null)
      }
    }
  )

  const { mutate: toggleRule } = useMutation(
    (p: { id: number; active: boolean }) => abacApi.toggle(p.id, p.active),
    {
      onSuccess: (res) => {
        if (res?.policy) {
          setPolicies(prev => prev.map(p => p.id === res.policy.id ? res.policy : p))
        }
        toast.show(`Rule ${res?.policy?.is_active ? 'activated' : 'deactivated'}`, 'success')
      }
    }
  )

  const handleSave = async () => {
    if (!newRule.name?.trim()) {
      toast.show('Rule name is required', 'error')
      return
    }
    await createRule()
  }

  const handleDelete = (rule: PolicyRule) => {
    if (!confirm(`Delete policy "${rule.name}"?`)) return
    deleteRule(rule.id)
  }

  const handleToggle = (rule: PolicyRule) => {
    toggleRule({ id: rule.id, active: !rule.is_active })
  }

  const handleUpdate = () => {
    if (!showEditModal?.name?.trim()) {
      toast.show('Rule name is required', 'error')
      return
    }
    updateRule({ id: showEditModal.id, data: showEditModal })
  }

  const renderCondition = (conditions: any) => {
    const parts: string[] = []
    if (conditions?.user && Object.keys(conditions.user).length > 0) {
      parts.push(`user: ${JSON.stringify(conditions.user)}`)
    }
    if (conditions?.resource && Object.keys(conditions.resource).length > 0) {
      parts.push(`resource: ${JSON.stringify(conditions.resource)}`)
    }
    if (conditions?.environment && Object.keys(conditions.environment).length > 0) {
      parts.push(`env: ${JSON.stringify(conditions.environment)}`)
    }
    return parts.length > 0 ? parts.join(', ') : 'Always'
  }

  const columns = [
    {
      key: 'name', header: 'Rule',
      render: (r: PolicyRule) => (
        <div>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {r.priority >= 80 && <span style={{ fontSize: '0.85rem' }}>🛡️</span>}
            {r.effect === 'deny' && <span style={{ fontSize: '0.85rem' }}>🚫</span>}
            {r.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{r.description}</div>
        </div>
      )
    },
    {
      key: 'priority', header: 'Priority',
      render: (r: PolicyRule) => (
        <Badge color={r.priority >= 80 ? 'amber' : r.priority >= 50 ? 'blue' : 'gray'}>
          {r.priority}
        </Badge>
      )
    },
    {
      key: 'effect', header: 'Effect',
      render: (r: PolicyRule) => (
        <Badge color={r.effect === 'allow' ? 'green' : 'rose'}>
          {r.effect === 'allow' ? 'ALLOW' : 'DENY'}
        </Badge>
      )
    },
    {
      key: 'conditions', header: 'Conditions', width: '300px',
      render: (r: PolicyRule) => (
        <code style={{
          fontSize: '0.68rem',
          background: '#f3f4f6',
          padding: '0.25rem 0.45rem',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '280px',
          display: 'inline-block'
        }}>{renderCondition(r.conditions)}</code>
      )
    },
    {
      key: 'is_active', header: 'Status',
      render: (r: PolicyRule) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <Badge color={r.is_active ? 'green' : 'gray'}>
            {r.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggle(r)}
            style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}
          >
            {r.is_active ? 'Disable' : 'Enable'}
          </Button>
        </div>
      )
    },
    {
      key: 'actions', header: 'Actions',
      render: (r: PolicyRule) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <Button size="sm" variant="ghost" onClick={() => setShowEditModal(r)}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}>
            ✏️ Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r)}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}>
            🗑️ Delete
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="abac-page">
      <div className="page-header">
        <div>
          <h1>ABAC Policy Rules</h1>
          <p className="page-subtitle">
            Attribute-Based Access Control rules that complement RBAC permissions.
            Rules are evaluated in priority order (highest first).
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          ➕ Create Rule
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      <Card>
        <Table
          columns={columns}
          data={policies}
          rowKey="id"
          loading={loading}
          emptyText="No policy rules defined. Create your first ABAC rule."
        />
      </Card>

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Policy Rule">
        <div className="abac-form">
          <Input label="Rule Name" value={newRule.name as string} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="Owner bypass" />
          <Input label="Description" value={newRule.description as string} onChange={e => setNewRule({ ...newRule, description: e.target.value })} placeholder="Allow owners full access regardless of other rules" />
          <div className="form-grid-2">
            <div className="form-group">
              <label>Effect</label>
              <select value={newRule.effect as string} onChange={e => setNewRule({ ...newRule, effect: e.target.value as 'allow' | 'deny' })}>
                <option value="allow">✅ ALLOW</option>
                <option value="deny">🚫 DENY</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <input type="number" min="0" max="100" value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-section">
            <label>Conditions (JSON)</label>
            <textarea
              value={JSON.stringify(newRule.conditions, null, 2)}
              onChange={e => {
                try {
                  setNewRule({ ...newRule, conditions: JSON.parse(e.target.value) })
                } catch {
                  // ignore invalid JSON while typing
                }
              }}
              placeholder='{"user": {"role": "admin"}, "resource": {"type": "sensitive"}}'
            />
            <div className="form-hint">
              Valid keys: user, resource, environment. Each is an object with key-value conditions.
            </div>
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Create Rule</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEditModal} onClose={() => setShowEditModal(null)} title="Edit Policy Rule">
        <div className="abac-form">
          <Input label="Rule Name" value={showEditModal?.name || ''} onChange={e => setShowEditModal(s => s ? { ...s, name: e.target.value } : null)} />
          <Input label="Description" value={showEditModal?.description || ''} onChange={e => setShowEditModal(s => s ? { ...s, description: e.target.value } : null)} />
          <div className="form-grid-2">
            <div className="form-group">
              <label>Effect</label>
              <select value={showEditModal?.effect || 'allow'} onChange={e => setShowEditModal(s => s ? { ...s, effect: e.target.value as 'allow' | 'deny' } : null)}>
                <option value="allow">✅ ALLOW</option>
                <option value="deny">🚫 DENY</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <input type="number" min="0" max="100" value={showEditModal?.priority || 50} onChange={e => setShowEditModal(s => s ? { ...s, priority: Number(e.target.value) } : null)} />
            </div>
          </div>
          <div className="form-section">
            <label>Conditions (JSON)</label>
            <textarea
              value={JSON.stringify(showEditModal?.conditions || {}, null, 2)}
              onChange={e => {
                try {
                  setShowEditModal(s => s ? { ...s, conditions: JSON.parse(e.target.value) } : null)
                } catch {
                  // ignore
                }
              }}
            />
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setShowEditModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}