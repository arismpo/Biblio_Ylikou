'use client'

import React, { useState, useEffect, useRef } from 'react'

interface NumberCellProps {
  value: string | number
  onChange: (value: string) => void
  darkMode: boolean
  onRowSelect?: (index: number) => void
  rowIndex?: number
  onColumnSelect?: (id: string) => void
  columnId?: string
  disabled?: boolean
}

const NumberCell: React.FC<NumberCellProps> = ({
  value,
  onChange,
  darkMode,
  onRowSelect,
  rowIndex,
  onColumnSelect,
  columnId,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) setInputValue(value || '')
  }, [value, isEditing])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    if (onRowSelect && rowIndex !== undefined) onRowSelect(rowIndex)
    if (onColumnSelect && columnId) onColumnSelect(columnId)
    if (!isEditing) {
      e.preventDefault()
      setIsEditing(true)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 10)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (inputValue !== value) onChange(inputValue)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      if (inputValue !== value) onChange(inputValue)
    }
    if (e.key === 'Escape') {
      setInputValue(value || '')
      setIsEditing(false)
    }
  }

  const hasValue = value !== undefined && value !== null && value !== ''
  const isDebitColumn = columnId && columnId.includes('debit')
  const isCreditColumn = columnId && columnId.includes('credit')

  let valueColor = ''
  if (hasValue) {
    if (isDebitColumn) {
      valueColor = darkMode ? 'text-green-400' : 'text-green-700'
    } else if (isCreditColumn) {
      valueColor = darkMode ? 'text-red-400' : 'text-red-700'
    }
  }

  const isDataColumn = columnId !== 'aa' && columnId !== 'day'
  const yellowBgColor = (hasValue && isDataColumn && !isDebitColumn && !isCreditColumn)
    ? (darkMode ? 'bg-yellow-500/10 text-yellow-200 border-yellow-600/30' : 'bg-yellow-50/60 text-yellow-900 border-yellow-200')
    : ''

  if (isEditing && !disabled) {
    return (
      <div className="w-full h-full" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="number"
          step="1"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full h-full px-2 py-1 text-center border rounded ${yellowBgColor || (darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-300')}`}
          style={{ display: 'block', margin: 0, width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  return (
    <div
      className={`w-full h-full px-2 py-1 text-center flex items-center justify-center transition-colors ${disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'} ${valueColor || (darkMode ? 'text-white' : 'text-gray-900')}`}
      onMouseDown={handleMouseDown}
      style={{ minHeight: '38px', width: '100%', height: '100%' }}
    >
      {value || ''}
    </div>
  )
}

export default NumberCell