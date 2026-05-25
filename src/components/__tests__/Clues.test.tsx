import { render, screen } from '@testing-library/react'
import { Clues } from '../Clues'

describe('Clues', () => {
  it('renders row clues horizontally', () => {
    const { container } = render(<Clues clues={[2, 1]} orientation="row" />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()

    const cluesContainer = container.firstChild as HTMLElement
    expect(cluesContainer).toHaveClass('flex-row')
  })

  it('renders column clues vertically', () => {
    const { container } = render(<Clues clues={[3, 1, 2]} orientation="column" />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    const cluesContainer = container.firstChild as HTMLElement
    expect(cluesContainer).toHaveClass('flex-col')
  })

  it('displays clue numbers correctly', () => {
    render(<Clues clues={[5, 3, 1]} orientation="row" />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows 0 for empty clues array', () => {
    render(<Clues clues={[]} orientation="row" />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('applies error color for error state', () => {
    render(<Clues clues={[2, 1]} orientation="row" validationState="error" />)
    const clueElement = screen.getByText('2')
    expect(clueElement).toHaveClass('text-error')
  })

  it('applies success color for valid state', () => {
    render(<Clues clues={[2, 1]} orientation="row" validationState="valid" />)
    const clueElement = screen.getByText('2')
    expect(clueElement).toHaveClass('text-success')
  })

  it('defaults to in-progress state', () => {
    render(<Clues clues={[2, 1]} orientation="row" />)
    const clueElement = screen.getByText('2')
    expect(clueElement).toHaveClass('text-gray-700')
  })

  it('applies in-progress color explicitly', () => {
    render(<Clues clues={[2, 1]} orientation="row" validationState="in-progress" />)
    const clueElement = screen.getByText('2')
    expect(clueElement).toHaveClass('text-gray-700')
  })
})
