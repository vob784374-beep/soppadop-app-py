import { useState } from 'react'
import { roleService } from '@/services'
import { Button, Card, Badge, Alert } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { Role, Permission } from '@/types'

export default function RolesPage() {
  const { data: roles, loading, error, refetch: refetchRoles } = useApi(() => roleService.list())
  const { data: permissions } = useApi(() => roleService.getPermissions())
  const [selected, setSelected] = useState<Role | null>(null)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const { mutate: createRole } = useMutation((d: { name: string; description?: string }) => roleService.create(d.name, d.description))
  const { mutate: deleteRole } = useMutation((id: number) => roleService.delete(id))
  const { mutate: togglePerm } = useMutation((p: { roleId: number; permId: number; has: boolean }) =>
    roleService.togglePermission(p.roleId, p.permId, p.has)
  )
  const toast = useToast()

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await createRole({ name: newName, description: newDesc })
    if (res) { setNewName(''); setNewDesc(''); toast.show('Role created', 'success'); refetchRoles() }
  }

  const handleDelete = async (role: Role) => {
    if (role.is_system) return toast.show('Cannot delete system role', 'warning')
    if (!confirm(`Delete "${role.name}"?`)) return
    const res = await deleteRole(role.id)
    if (res) { setSelected(null); toast.show('Role deleted', 'success'); refetchRoles() }
  }

  const handleTogglePerm = async (role: Role, perm: Permission) => {
    const has = role.permissions?.some(p => p.id === perm.id) || false
    const res = await togglePerm({ roleId: role.id, permId: perm.id, has })
    if (res) { toast.show('Permissions updated', 'success'); refetchRoles() }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Roles & Permissions</h1>
      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <Card title={`Roles (${roles?.length || 0})`}>
            {(roles || []).map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{
                padding: '0.75rem', borderRadius: '4px', cursor: 'pointer',
                background: selected?.id === r.id ? '#eff6ff' : 'transparent',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{r.name}</strong>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {r.is_system && <Badge color="gray">system</Badge>}
                    <Badge color="purple">{r.permissions?.length || 0} perms</Badge>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{r.description}</p>
              </div>
            ))}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h4>Create Role</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </Card>
        </div>

        <Card title={selected ? `${selected.name} Permissions` : 'Select a role'}>
          {selected && (
            <>
              {!selected.is_system && (
                <Button variant="danger" size="sm" onClick={() => handleDelete(selected)} style={{ marginBottom: '1rem' }}>
                  Delete Role
                </Button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(permissions || []).map(p => {
                  const has = selected.permissions?.some(rp => rp.id === p.id)
                  return (
                    <span key={p.id} onClick={() => handleTogglePerm(selected, p)} style={{
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                      background: has ? '#22c55e' : '#e5e7eb', color: has ? '#fff' : '#374151',
                    }}>
                      {p.name}
                    </span>
                  )
                })}
              </div>
            </>
          )}
          {!selected && <p style={{ color: '#6b7280' }}>Click a role to manage its permissions</p>}
        </Card>
      </div>
    </div>
  )
}
