import React, { useState, useCallback } from 'react'

export interface ApiKeyInputProps {
  onKeySubmit: (apiKey: string) => void
  initialKey?: string
  isValidating?: boolean
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onKeySubmit,
  initialKey = '',
  isValidating = false,
}) => {
  const [apiKey, setApiKey] = useState(initialKey)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const validateApiKey = useCallback((key: string): string => {
    if (!key || key.trim() === '') {
      return 'API Key is required'
    }
    if (!key.startsWith('sk-ant-')) {
      return 'API Key must start with "sk-ant-"'
    }
    if (key.length < 20) {
      return 'API Key must be at least 20 characters'
    }
    return ''
  }, [])

  const handleSubmit = useCallback(() => {
    const validationError = validateApiKey(apiKey)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onKeySubmit(apiKey)
  }, [apiKey, validateApiKey, onKeySubmit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }, [error])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const toggleVisibility = useCallback(() => {
    setShowKey(prev => !prev)
  }, [])

  const inputId = 'api-key-input'
  const errorId = 'api-key-error'

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-4">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            id={inputId}
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isValidating}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            placeholder="sk-ant-..."
            className={`
              w-full px-4 py-2 pr-12 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-error focus:ring-error' : 'border-gray-300'}
            `}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={isValidating}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isValidating}
        aria-label="Validate API key"
        className={`
          w-full px-4 py-2 rounded-lg font-medium
          transition-colors duration-200
          ${
            isValidating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-blue-800 text-white'
          }
        `}
      >
        {isValidating ? 'Validating...' : 'Validate Key'}
      </button>
    </div>
  )
}

export default ApiKeyInput
