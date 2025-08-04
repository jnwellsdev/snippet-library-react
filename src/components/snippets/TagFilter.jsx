import { useState, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ListFilter, Check } from 'lucide-react'
import { getAllTags } from '../../services/firestoreService'
import './TagFilter.css'

const TagFilter = ({ selectedTags = [], onTagsChange, sortBy = 'popular', onSortChange, className = '' }) => {
	const [availableTags, setAvailableTags] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		const loadTags = async () => {
			try {
				const tags = await getAllTags()
				setAvailableTags(tags)
			} catch (error) {
				console.error('Error loading tags:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadTags()
	}, [])

	const handleTagToggle = (tag) => {
		const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

		onTagsChange?.(newSelectedTags)
	}

	const handleClearAll = () => {
		onTagsChange?.([])
	}

	const hasSelectedTags = selectedTags.length > 0

	return (
		<DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenu.Trigger asChild>
				<button className={`tag-filter-button ${hasSelectedTags ? 'active' : ''} ${className}`} aria-label='Filter by tags'>
					<ListFilter size={16} />
					{hasSelectedTags && <span className='tag-filter-badge'>{selectedTags.length}</span>}
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className='tag-filter-content' sideOffset={4} side='left' align='start'>
					<div className='tag-filter-header'>
						<span className='tag-filter-title'>Sort By</span>
					</div>
					<div className='tag-filter-sort-options'>
						<button className={`tag-filter-sort-option ${sortBy === 'popular' ? 'active' : ''}`} onClick={() => onSortChange?.('popular')}>
							Popular
						</button>
						<button className={`tag-filter-sort-option ${sortBy === 'recent' ? 'active' : ''}`} onClick={() => onSortChange?.('recent')}>
							Recent
						</button>
					</div>

					<div className='tag-filter-header'>
						<span className='tag-filter-title'>Filter by Tags</span>
						{hasSelectedTags && (
							<button className='tag-filter-clear' onClick={handleClearAll}>
								Clear all
							</button>
						)}
					</div>

					{isLoading ? (
						<div className='tag-filter-loading'>Loading tags...</div>
					) : !availableTags || availableTags.length === 0 ? (
						<div className='tag-filter-empty'>No tags available</div>
					) : (
						<div className='tag-filter-list'>
							{availableTags.map((tag) => {
								const isSelected = selectedTags.includes(tag)
								return (
									<DropdownMenu.CheckboxItem
										key={tag}
										className='tag-filter-item'
										checked={isSelected}
										onCheckedChange={() => handleTagToggle(tag)}
										onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
									>
										<div className='tag-filter-item-content'>
											<span className='tag-filter-item-text'>{tag}</span>
											<DropdownMenu.ItemIndicator className='tag-filter-check'>
												<Check size={14} />
											</DropdownMenu.ItemIndicator>
										</div>
									</DropdownMenu.CheckboxItem>
								)
							})}
						</div>
					)}

					<DropdownMenu.Arrow className='tag-filter-arrow' />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export default TagFilter
