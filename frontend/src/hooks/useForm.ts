import { useState, useCallback, FormEvent } from 'react'

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
  validate?: (values: T) => Partial<Record<keyof T, string>>
}

export function useForm<T extends Record<string, any>>({ initialValues, onSubmit, validate }: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitError('')
  }, [initialValues])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (validate) {
      const errs = validate(values)
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit(values)
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || 'Submit failed')
    } finally {
      setLoading(false)
    }
  }, [values, onSubmit, validate])

  return { values, errors, loading, submitError, setValue, setSubmitError, reset, handleSubmit }
}
