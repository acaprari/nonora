import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Cell } from '../Cell'

describe('Cell', () => {
  it('renders empty cell with correct styling', () => {
    render(<Cell state="empty" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('bg-white')
    expect(cell).toHaveClass('border-cell-border')
  })

  it('renders filled cell with green background', () => {
    render(<Cell state="filled" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('bg-cell-filled')
  })

  it('renders marked cell with X symbol', () => {
    render(<Cell state="marked" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('bg-white')
    expect(cell.textContent).toBe('×')
  })

  it('shows error border when validationState is error', () => {
    render(
      <Cell
        state="empty"
        validationState="error"
        onClick={() => {}}
        row={0}
        col={0}
      />
    )
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('border-error')
  })

  it('shows success border when validationState is valid', () => {
    render(
      <Cell
        state="filled"
        validationState="valid"
        onClick={() => {}}
        row={0}
        col={0}
      />
    )
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('border-success')
  })

  it('defaults validationState to in-progress', () => {
    render(<Cell state="empty" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('border-cell-border')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Cell state="empty" onClick={handleClick} row={0} col={0} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has accessible aria-label', () => {
    render(<Cell state="empty" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveAttribute('aria-label', 'Cell empty')
  })

  it('applies proper styling classes', () => {
    render(<Cell state="empty" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('w-full')
    expect(cell).toHaveClass('aspect-square')
    expect(cell).toHaveClass('border')
    expect(cell).toHaveClass('rounded')
    expect(cell).toHaveClass('cursor-pointer')
    expect(cell).toHaveClass('transition-colors')
  })

  it('has touch-friendly styling', () => {
    render(<Cell state="empty" onClick={() => {}} row={0} col={0} />)
    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('touch-manipulation')
  })
})
