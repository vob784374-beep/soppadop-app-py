import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { roleService } from '@/services'
import {
  Button, Card, Badge, Alert, Input, Switch, AvatarGroup, Modal
} from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { Role, Permission } from '@/types'
import './RolesPage.scss'

export default function RolesPage() {
  const { t } = useTranslation()
  const { data: rolesListData, loading, error } = useApi(() => roleService.list())
  const { data: permissions } = useApi(() => roleService.getPermissions())
  const [roles, setRoles] = useState<Role[]>([])
  const [selected, setSelected] = useState<Role | null>(null)
  const [searchRole, setSearchRole] = useState('')
  const [searchPerm, setSearchPerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { mutate: createRole } = useMutation(
    (d: { name: string; description?: string }) => roleService.create(d.name, d.description),
    {
      onSuccess: (res) => {
        if (res?.role) {
          setRoles(prev => [...prev, res.role])
          toast.show(t('roles.roleCreated'), 'success')
        }
      }
    }
  )

  const { mutate: deleteRole } = useMutation(
    (id: number) => roleService.delete(id),
    {
      onSuccess: () => {
        setRoles(prev => prev.filter(r => !r.is_system))
        setSelected(null)
        toast.show(t('roles.roleDeleted'), 'success')
      }
    }
  )

  const { mutate: togglePerm } = useMutation(
    (p: { roleId: number; permId: number; has: boolean }) =>
      roleService.togglePermission(p.roleId, p.permId, p.has),
    {
      onMutate: async (variables) => {
        // Optimistic update: cập nhật UI ngay lập tức trước khi API trả về
        const { roleId, permId, has } = variables
        
        // Tìm permission details từ danh sách permissions
        const permDetails = permissions?.find(p => p.id === permId)
        
        setRoles(prev => prev.map(r => {
          if (r.id === roleId) {
            const currentPerms = r.permissions || []
            let newPerms
            if (has) {
              // Remove permission
              newPerms = currentPerms.filter(p => p.id !== permId)
            } else {
              // Add permission - dùng data thật từ permissions list
              if (permDetails && !currentPerms.find(p => p.id === permId)) {
                newPerms = [...currentPerms, permDetails]
              } else {
                newPerms = currentPerms
              }
            }
            return { ...r, permissions: newPerms }
          }
          return r
        }))
        
        // Cập nhật selected role nếu đang mở panel này
        if (selected?.id === roleId) {
          setSelected(prev => {
            if (!prev) return prev
            const currentPerms = prev.permissions || []
            let newPerms
            if (has) {
              newPerms = currentPerms.filter(p => p.id !== permId)
            } else {
              if (permDetails && !currentPerms.find(p => p.id === permId)) {
                newPerms = [...currentPerms, permDetails]
              } else {
                newPerms = currentPerms
              }
            }
            return { ...prev, permissions: newPerms }
          })
        }
        
        return { previousRoles: roles }
      },
      onError: (_err, variables, context) => {
        // Nếu API fail, revert lại state cũ
        if (context?.previousRoles) {
          setRoles(context.previousRoles)
          if (selected?.id === variables.roleId) {
            const prevRole = context.previousRoles.find((r: Role) => r.id === variables.roleId)
            setSelected(prevRole || null)
          }
        }
      },
      onSuccess: (res) => {
        if (res?.role) {
          // Sync lại với data thật từ server
          setRoles(prev => prev.map(r => r.id === res.role.id ? res.role : r))
          if (selected?.id === res.role.id) {
            setSelected(res.role)
          }
          toast.show(t('roles.permissionsUpdated'), 'success')
        }
      }
    }
  )

  const toast = useToast()

  // Filter roles by search
  const filteredRoles = useMemo(() => {
    if (!roles) return []
    if (!searchRole.trim()) return roles
    const query = searchRole.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.description || '').toLowerCase().includes(query)
    )
  }, [roles, searchRole])

  // Group permissions by resource and filter
  const groupedPermissions = useMemo(() => {
    if (!permissions) return {}
    let perms = permissions
    if (searchPerm.trim()) {
      const query = searchPerm.toLowerCase()
      perms = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.resource.toLowerCase().includes(query) ||
          p.action.toLowerCase().includes(query)
      )
    }
    return perms.reduce((acc: Record<string, Permission[]>, perm) => {
      const resource = perm.resource || 'other'
      if (!acc[resource]) acc[resource] = []
      acc[resource].push(perm)
      return acc
    }, {})
  }, [permissions, searchPerm])

  useEffect(() => {
    if (rolesListData) {
      setRoles(rolesListData)
    }
  }, [rolesListData])

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createRole({ name: newName, description: newDesc })
    setNewName('')
    setNewDesc('')
    setCreateModalOpen(false)
  }

  const handleDelete = async (role: Role) => {
    if (role.is_system) {
      toast.show(t('roles.cannotDeleteSystem'), 'warning')
      return
    }
    const confirmed = window.confirm(t('roles.confirmDelete', { name: role.name }))
    if (!confirmed) return
    await deleteRole(role.id)
  }

  const handleTogglePerm = async (roleId: number, permId: number) => {
    const role = roles.find(r => r.id === roleId)
    const perm = permissions?.find(p => p.id === permId)
    if (!role || !perm) return
    
    const has = role.permissions?.some((p) => p.id === permId) || false
    await togglePerm({ roleId, permId, has })
  }

  if (loading) {
    return (
      <div className="roles-page">
        <div className="page-header">
          <h1>{t('roles.title')}</h1>
        </div>
        <div className="loading">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="roles-page">
      <div className="page-header">
        <div>
          <h1>{t('roles.title')}</h1>
          <p className="page-subtitle">{t('roles.subtitle')}</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} variant="primary">
          {t('roles.createRole')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="roles-main">
        {/* Roles Panel */}
        <Card className="roles-panel" title={t('roles.rolesCount', { count: (roles || []).length })}>
          <div className="roles-search">
            <Input
              placeholder={t('roles.searchRoles')}
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
          </div>

          <div className="roles-list">
            {filteredRoles.length === 0 ? (
              <div className="empty-state">
                <p>{t('roles.noRolesFound')}</p>
              </div>
            ) : (
              filteredRoles.map((r) => (
                <div
                  key={r.id}
                  className={`role-item ${selected?.id === r.id ? 'selected' : ''}`}
                  onClick={() => setSelected(r)}
                >
                  <div className="role-item-left">
                    <div className="role-avatar-group">
                      <AvatarGroup
                        users={r.users || []}
                        maxDisplay={3}
                        size="sm"
                      />
                    </div>
                    <div className="role-info">
                      <div className="role-name-row">
                        <strong>{r.name}</strong>
                        <div className="role-badges">
                          {r.is_system && <Badge color="gray">{t('roles.system')}</Badge>}
                          {r.is_super_admin && <Badge color="purple">{t('roles.superAdmin')}</Badge>}
                          <Badge color="blue">{r.permissions?.length || 0} {t('roles.perms')}</Badge>
                        </div>
                      </div>
                      <p className="role-desc">{r.description}</p>
                      <div className="role-stats">
                        <span className="role-stat">
                          👥 {r.user_count || 0} {t('roles.users')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="role-item-right">
                    {!r.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(r)
                        }}
                      >
                        {t('roles.deleteRole')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Permissions Panel */}
        <Card className="permissions-panel" title={selected ? t('roles.permissions', { name: selected.name }) : t('roles.selectRole')}>
          {!selected ? (
            <div className="empty-state">
              <div className="empty-icon">🛡️</div>
              <p>{t('roles.clickToManage')}</p>
              <p className="empty-hint">{t('roles.selectRoleHint')}</p>
            </div>
          ) : (
            <>
              <div className="selected-role-header">
                <div className="role-meta">
                  <div className="role-info-sm">
                    <strong>{selected.name}</strong>
                    {selected.is_system && <Badge color="gray">{t('roles.system')}</Badge>}
                  </div>
                  <p className="role-desc-sm">{selected.description}</p>
                </div>
                {!selected.is_system && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(selected)}
                  >
                    {t('roles.deleteRole')}
                  </Button>
                )}
              </div>

              <div className="permissions-search">
                <Input
                  placeholder={t('roles.searchPermissions')}
                  value={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.value)}
                />
              </div>

              <div className="permissions-list">
                {Object.keys(groupedPermissions).length === 0 ? (
                  <div className="empty-state">
                    <p>{t('roles.noPermissions')}</p>
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="permission-group">
                      <div className="permission-group-header">
                        <h4>{resource}</h4>
                        <Badge color="blue">{perms.length}</Badge>
                      </div>
                      <div className="permission-items">
                        {perms.map((p) => {
                          const has = selected.permissions?.some((rp) => rp.id === p.id) || false
                          return (
                            <div key={p.id} className="permission-item">
                              <div 
                                className="permission-info" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleTogglePerm(selected.id, p.id)}
                              >
                                <span className="permission-name">{p.name}</span>
                                <span className="permission-action">{p.action}</span>
                                {p.description && (
                                  <span className="permission-desc">{p.description}</span>
                                )}
                              </div>
                              <Switch
                                checked={has}
                                onChange={() => handleTogglePerm(selected.id, p.id)}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Create Role Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setNewName('')
          setNewDesc('')
        }}
        title={t('roles.createRole')}
      >
        <div className="create-form">
          <Input
            label={t('roles.name')}
            placeholder={t('roles.enterName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <Input
            label={t('roles.description')}
            placeholder={t('roles.enterDescription')}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="modal-actions">
            <Button
              variant="ghost"
              onClick={() => {
                setCreateModalOpen(false)
                setNewName('')
                setNewDesc('')
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              {t('roles.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
