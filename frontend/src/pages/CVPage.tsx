import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cvService } from '@/services'
import { Button, Card, Table, Modal, Input, Badge } from '@/components/ui'
import { useApi, useMutation } from '@/hooks'
import { useToast } from '@/components/ui'
import type { CV, CVSummary } from '@/types'

type ActiveSection = 'list' | 'personal' | 'education' | 'experience' | 'skills' | 'projects' | 'certifications'

export default function CVPage() {
  const { t } = useTranslation()
  const toast = useToast()

  const [page, setPage] = useState(1)
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>('list')
  const [refreshKey, setRefreshKey] = useState(0)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newFullName, setNewFullName] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<Partial<CV>>({})

  const [showSectionModal, setShowSectionModal] = useState(false)
  const [sectionType, setSectionType] = useState('')
  const [sectionData, setSectionData] = useState<Record<string, string>>({})
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)

  const { data, loading } = useApi(() => cvService.list({ page, per_page: 10 }), [page, refreshKey])

  const { mutate: createMut } = useMutation((d: Partial<CV>) => cvService.create(d))
  const { mutate: updateMut } = useMutation((p: { id: number; data: Partial<CV> }) => cvService.update(p.id, p.data))
  const { mutate: deleteMut } = useMutation((id: number) => cvService.delete(id))
  const { mutate: setDefaultMut } = useMutation((id: number) => cvService.setDefault(id))

  const loadCV = async (id: number) => {
    const cv = await cvService.getById(id)
    setSelectedCV(cv)
    setActiveSection('personal')
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newFullName.trim()) return
    const cv = await createMut({ title: newTitle, full_name: newFullName })
    if (cv) {
      toast.show(t('cv.created'), 'success')
      setShowCreateModal(false)
      setNewTitle('')
      setNewFullName('')
      setRefreshKey(k => k + 1)
      loadCV(cv.id)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('cv.confirmDelete'))) return
    await deleteMut(id)
    toast.show(t('cv.deleted'), 'success')
    if (selectedCV?.id === id) setSelectedCV(null)
    setRefreshKey(k => k + 1)
  }

  const handleSetDefault = async (id: number) => {
    await setDefaultMut(id)
    toast.show(t('cv.setDefault'), 'success')
    setRefreshKey(k => k + 1)
  }

  const handleSavePersonal = async () => {
    if (!selectedCV) return
    const cv = await updateMut({ id: selectedCV.id, data: editData })
    if (cv) {
      setSelectedCV(cv)
      setShowEditModal(false)
      toast.show(t('cv.updated'), 'success')
      setRefreshKey(k => k + 1)
    }
  }

  const openSectionModal = (type: string, data?: Record<string, string>) => {
    setSectionType(type)
    setSectionData(data || {})
    setEditingSectionId(data?.id ? Number(data.id) : null)
    setShowSectionModal(true)
  }

  const handleSaveSection = async () => {
    if (!selectedCV) return
    try {
      if (sectionType === 'education') {
        if (editingSectionId) {
          await cvService.updateEducation(selectedCV.id, editingSectionId, sectionData)
        } else {
          await cvService.addEducation(selectedCV.id, sectionData)
        }
      } else if (sectionType === 'experience') {
        if (editingSectionId) {
          await cvService.updateExperience(selectedCV.id, editingSectionId, sectionData)
        } else {
          await cvService.addExperience(selectedCV.id, sectionData)
        }
      } else if (sectionType === 'skill') {
        if (editingSectionId) {
          await cvService.updateSkill(selectedCV.id, editingSectionId, sectionData)
        } else {
          await cvService.addSkill(selectedCV.id, sectionData)
        }
      } else if (sectionType === 'project') {
        if (editingSectionId) {
          await cvService.updateProject(selectedCV.id, editingSectionId, sectionData)
        } else {
          await cvService.addProject(selectedCV.id, sectionData)
        }
      } else if (sectionType === 'certification') {
        if (editingSectionId) {
          await cvService.updateCertification(selectedCV.id, editingSectionId, sectionData)
        } else {
          await cvService.addCertification(selectedCV.id, sectionData)
        }
      }
      toast.show(editingSectionId ? t('cv.updated') : t('cv.added'), 'success')
      setShowSectionModal(false)
      const cv = await cvService.getById(selectedCV.id)
      setSelectedCV(cv)
    } catch {
      toast.show(t('cv.error'), 'error')
    }
  }

  const handleDeleteSection = async (type: string, id: number) => {
    if (!selectedCV) return
    if (!confirm(t('cv.confirmDeleteSection'))) return
    try {
      if (type === 'education') await cvService.deleteEducation(selectedCV.id, id)
      else if (type === 'experience') await cvService.deleteExperience(selectedCV.id, id)
      else if (type === 'skill') await cvService.deleteSkill(selectedCV.id, id)
      else if (type === 'project') await cvService.deleteProject(selectedCV.id, id)
      else if (type === 'certification') await cvService.deleteCertification(selectedCV.id, id)
      toast.show(t('cv.deleted'), 'success')
      const cv = await cvService.getById(selectedCV.id)
      setSelectedCV(cv)
    } catch {
      toast.show(t('cv.error'), 'error')
    }
  }

  const listColumns = [
    { key: 'title', header: t('cv.title') },
    { key: 'full_name', header: t('cv.fullName') },
    { key: 'email', header: t('cv.email') },
    {
      key: 'status', header: t('cv.status'),
      render: (r: CVSummary) => <Badge color={r.status === 'published' ? 'green' : r.status === 'draft' ? 'yellow' : 'gray'}>{r.status}</Badge>,
    },
    {
      key: 'default', header: '',
      render: (r: CVSummary) => r.is_default ? <Badge color="blue">{t('cv.default')}</Badge> : null,
    },
    {
      key: 'actions', header: t('common.actions'), width: '250px',
      render: (r: CVSummary) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Button size="sm" variant="primary" onClick={() => loadCV(r.id)}>{t('cv.edit')}</Button>
          {!r.is_default && <Button size="sm" variant="ghost" onClick={() => handleSetDefault(r.id)}>{t('cv.setDefault')}</Button>}
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ]

  const sectionLabels: Record<string, string> = {
    education: t('cv.education'),
    experience: t('cv.experience'),
    skill: t('cv.skill'),
    project: t('cv.project'),
    certification: t('cv.certification'),
  }

  const sectionFields: Record<string, { key: string; label: string; required?: boolean }[]> = {
    education: [
      { key: 'school', label: t('cv.school'), required: true },
      { key: 'degree', label: t('cv.degree') },
      { key: 'field_of_study', label: t('cv.fieldOfStudy') },
      { key: 'start_date', label: t('cv.startDate') },
      { key: 'end_date', label: t('cv.endDate') },
      { key: 'description', label: t('cv.description') },
    ],
    experience: [
      { key: 'company', label: t('cv.company'), required: true },
      { key: 'position', label: t('cv.position'), required: true },
      { key: 'start_date', label: t('cv.startDate') },
      { key: 'end_date', label: t('cv.endDate') },
      { key: 'description', label: t('cv.description') },
    ],
    skill: [
      { key: 'name', label: t('cv.skillName'), required: true },
      { key: 'level', label: t('cv.level') },
      { key: 'category', label: t('cv.category') },
    ],
    project: [
      { key: 'name', label: t('cv.projectName'), required: true },
      { key: 'description', label: t('cv.description') },
      { key: 'technologies', label: t('cv.technologies') },
      { key: 'url', label: t('cv.url') },
      { key: 'start_date', label: t('cv.startDate') },
      { key: 'end_date', label: t('cv.endDate') },
    ],
    certification: [
      { key: 'name', label: t('cv.certName'), required: true },
      { key: 'issuer', label: t('cv.issuer') },
      { key: 'date', label: t('cv.date') },
      { key: 'url', label: t('cv.url') },
    ],
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('cv.title')}</h1>
        {selectedCV ? (
          <Button variant="ghost" onClick={() => { setSelectedCV(null); setActiveSection('list') }}>
            {t('cv.backToList')}
          </Button>
        ) : (
          <Button variant="success" onClick={() => setShowCreateModal(true)}>{t('cv.create')}</Button>
        )}
      </div>

      {!selectedCV ? (
        <>
          <Card>
            <Table columns={listColumns} data={data?.cvs || []} rowKey="id" loading={loading} emptyText={t('cv.noCVs')} />
          </Card>
          {data && data.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous')}</Button>
              <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>{t('common.pageInfo', { page: data.page, pages: data.pages })}</span>
              <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>{t('common.next')}</Button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Sidebar sections */}
          <div style={{ width: '200px', flexShrink: 0 }}>
            <Card style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {t('cv.sections')}
              </div>
              {(['personal', 'education', 'experience', 'skills', 'projects', 'certifications'] as ActiveSection[]).map(section => (
                <div
                  key={section}
                  onClick={() => setActiveSection(section)}
                  style={{
                    padding: '0.375rem 0.5rem', borderRadius: '4px', cursor: 'pointer',
                    fontSize: '0.8rem', marginBottom: '0.25rem',
                    background: activeSection === section ? '#eff6ff' : 'transparent',
                    fontWeight: activeSection === section ? 600 : 400,
                    color: activeSection === section ? '#1d4ed8' : '#374151',
                  }}
                >
                  {t(`cv.${section}`)}
                </div>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {activeSection === 'personal' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.personalInfo')}</h2>
                  <Button size="sm" onClick={() => { setEditData(selectedCV); setShowEditModal(true) }}>{t('common.edit')}</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>{t('cv.fullName')}:</strong> {selectedCV.full_name}</div>
                  <div><strong>{t('cv.email')}:</strong> {selectedCV.email || '-'}</div>
                  <div><strong>{t('cv.phone')}:</strong> {selectedCV.phone || '-'}</div>
                  <div><strong>{t('cv.address')}:</strong> {selectedCV.address || '-'}</div>
                  <div><strong>{t('cv.website')}:</strong> {selectedCV.website || '-'}</div>
                  <div><strong>{t('cv.linkedin')}:</strong> {selectedCV.linkedin || '-'}</div>
                  <div><strong>{t('cv.github')}:</strong> {selectedCV.github || '-'}</div>
                  <div><strong>{t('cv.status')}:</strong> <Badge color={selectedCV.status === 'published' ? 'green' : 'yellow'}>{selectedCV.status}</Badge></div>
                </div>
                {selectedCV.summary && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>{t('cv.summary')}:</strong>
                    <p style={{ marginTop: '0.25rem', color: '#6b7280' }}>{selectedCV.summary}</p>
                  </div>
                )}
              </Card>
            )}

            {activeSection === 'education' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.education')}</h2>
                  <Button size="sm" variant="success" onClick={() => openSectionModal('education')}>{t('cv.addEducation')}</Button>
                </div>
                {(selectedCV.educations || []).length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('cv.noEducation')}</div>
                ) : (
                  selectedCV.educations.map(edu => (
                    <div key={edu.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{edu.school}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{edu.degree} {edu.field_of_study && `- ${edu.field_of_study}`}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{edu.start_date} - {edu.end_date || t('cv.present')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button size="sm" variant="ghost" onClick={() => openSectionModal('education', { ...edu, id: String(edu.id) } as Record<string, string>)}>{t('common.edit')}</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteSection('education', edu.id)}>{t('common.delete')}</Button>
                        </div>
                      </div>
                      {edu.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{edu.description}</p>}
                    </div>
                  ))
                )}
              </Card>
            )}

            {activeSection === 'experience' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.experience')}</h2>
                  <Button size="sm" variant="success" onClick={() => openSectionModal('experience')}>{t('cv.addExperience')}</Button>
                </div>
                {(selectedCV.experiences || []).length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('cv.noExperience')}</div>
                ) : (
                  selectedCV.experiences.map(exp => (
                    <div key={exp.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{exp.position}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{exp.company}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{exp.start_date} - {exp.is_current ? t('cv.present') : (exp.end_date || '-')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button size="sm" variant="ghost" onClick={() => openSectionModal('experience', { ...exp, id: String(exp.id) } as Record<string, string>)}>{t('common.edit')}</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteSection('experience', exp.id)}>{t('common.delete')}</Button>
                        </div>
                      </div>
                      {exp.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{exp.description}</p>}
                    </div>
                  ))
                )}
              </Card>
            )}

            {activeSection === 'skills' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.skills')}</h2>
                  <Button size="sm" variant="success" onClick={() => openSectionModal('skill')}>{t('cv.addSkill')}</Button>
                </div>
                {(selectedCV.skills || []).length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('cv.noSkills')}</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedCV.skills.map(skill => (
                      <div key={skill.id} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500 }}>{skill.name}</span>
                        {skill.level && <Badge color="blue">{skill.level}</Badge>}
                        <Button size="sm" variant="ghost" onClick={() => openSectionModal('skill', { ...skill, id: String(skill.id) } as Record<string, string})} style={{ padding: '0 0.25rem' }}>✎</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteSection('skill', skill.id)} style={{ padding: '0 0.25rem' }}>×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeSection === 'projects' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.projects')}</h2>
                  <Button size="sm" variant="success" onClick={() => openSectionModal('project')}>{t('cv.addProject')}</Button>
                </div>
                {(selectedCV.projects || []).length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('cv.noProjects')}</div>
                ) : (
                  selectedCV.projects.map(proj => (
                    <div key={proj.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{proj.name}</div>
                          {proj.technologies && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{proj.technologies}</div>}
                          {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{proj.url}</a>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button size="sm" variant="ghost" onClick={() => openSectionModal('project', { ...proj, id: String(proj.id) } as Record<string, string>)}>{t('common.edit')}</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteSection('project', proj.id)}>{t('common.delete')}</Button>
                        </div>
                      </div>
                      {proj.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{proj.description}</p>}
                    </div>
                  ))
                )}
              </Card>
            )}

            {activeSection === 'certifications' && (
              <Card style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2>{t('cv.certifications')}</h2>
                  <Button size="sm" variant="success" onClick={() => openSectionModal('certification')}>{t('cv.addCertification')}</Button>
                </div>
                {(selectedCV.certifications || []).length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>{t('cv.noCertifications')}</div>
                ) : (
                  selectedCV.certifications.map(cert => (
                    <div key={cert.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{cert.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cert.issuer} {cert.date && `(${cert.date})`}</div>
                          {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{cert.url}</a>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button size="sm" variant="ghost" onClick={() => openSectionModal('certification', { ...cert, id: String(cert.id) } as Record<string, string>)}>{t('common.edit')}</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteSection('certification', cert.id)}>{t('common.delete')}</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create CV Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('cv.createCV')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('cv.title')} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="My Resume" />
          <Input label={t('cv.fullName')} value={newFullName} onChange={e => setNewFullName(e.target.value)} placeholder="John Doe" />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button variant="success" onClick={handleCreate} disabled={!newTitle.trim() || !newFullName.trim()}>{t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Personal Info Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={t('cv.editPersonal')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('cv.fullName')} value={editData.full_name || ''} onChange={e => setEditData({ ...editData, full_name: e.target.value })} />
          <Input label={t('cv.email')} value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} />
          <Input label={t('cv.phone')} value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
          <Input label={t('cv.address')} value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} />
          <Input label={t('cv.website')} value={editData.website || ''} onChange={e => setEditData({ ...editData, website: e.target.value })} />
          <Input label={t('cv.linkedin')} value={editData.linkedin || ''} onChange={e => setEditData({ ...editData, linkedin: e.target.value })} />
          <Input label={t('cv.github')} value={editData.github || ''} onChange={e => setEditData({ ...editData, github: e.target.value })} />
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('cv.summary')}</label>
            <textarea value={editData.summary || ''} onChange={e => setEditData({ ...editData, summary: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '80px', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSavePersonal}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Section Modal */}
      <Modal open={showSectionModal} onClose={() => setShowSectionModal(false)} title={editingSectionId ? t('cv.editSection') : t('cv.addSection')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sectionFields[sectionType] || []).map(field => (
            <Input
              key={field.key}
              label={field.label + (field.required ? ' *' : '')}
              value={sectionData[field.key] || ''}
              onChange={e => setSectionData({ ...sectionData, [field.key]: e.target.value })}
            />
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowSectionModal(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSaveSection}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
