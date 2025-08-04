import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateString, validateHtmlContent } from '../../utils/validation'
import { toTitleCase } from '../../utils/transformers'
import { LoadingButton } from '../index'
import './SnippetForm.css'

const SnippetForm = ({ onSubmit, loading = false, initialData = null }) => {
	const [formData, setFormData] = useState({
		title: initialData?.title || '',
		htmlContent: initialData?.htmlContent || '',
		tags: initialData?.tags || [],
	})
	const [errors, setErrors] = useState({})
	const [touched, setTouched] = useState({})
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const [tagInput, setTagInput] = useState('')
	const navigate = useNavigate()

	const validateField = (name, value) => {
		let validation = { isValid: true, errors: [] }

		switch (name) {
			case 'title':
				validation = validateString(value, {
					minLength: 1,
					maxLength: 200,
					required: true,
				})
				break
			case 'htmlContent':
				validation = validateHtmlContent(value)
				break
			case 'tags':
				if (Array.isArray(value)) {
					const invalidTags = value.filter((tag) => typeof tag !== 'string' || tag.length === 0 || tag.length > 50)
					if (invalidTags.length > 0) {
						validation = {
							isValid: false,
							errors: ['Tags must be 1-50 characters long'],
						}
					} else if (value.length > 10) {
						validation = { isValid: false, errors: ['Maximum 10 tags allowed'] }
					}
				} else {
					validation = { isValid: false, errors: ['Tags must be an array'] }
				}
				break
			default:
				break
		}
		return validation
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))

		// clear errors
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: [] }))
		}
	}

	const handleBlur = (e) => {
		const { name, value } = e.target
		setTouched((prev) => ({ ...prev, [name]: true }))

		if (hasSubmitted) {
			const validation = validateField(name, value)
			if (!validation.isValid) {
				setErrors((prev) => ({ ...prev, [name]: validation.errors }))
			} else {
				setErrors((prev) => ({ ...prev, [name]: [] }))
			}
		}
	}

	const handleAddTag = () => {
		const trimmedTag = tagInput.trim()
		if (trimmedTag) {
			const titleCaseTag = toTitleCase(trimmedTag)
			if (!formData.tags.includes(titleCaseTag) && formData.tags.length < 10) {
				setFormData((prev) => ({ ...prev, tags: [...prev.tags, titleCaseTag] }))
				setTagInput('')
				if (errors.tags) {
					setErrors((prev) => ({ ...prev, tags: [] }))
				}
			}
		}
	}

	const handleRemoveTag = (tagToRemove) => {
		setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
	}

	const handleTagInputKeyPress = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAddTag()
		}
	}

	const validateForm = () => {
		const newErrors = {}
		let isValid = true

		Object.keys(formData).forEach((field) => {
			const validation = validateField(field, formData[field])
			if (!validation.isValid) {
				newErrors[field] = validation.errors
				isValid = false
			}
		})

		setErrors(newErrors)
		setTouched({
			title: true,
			htmlContent: true,
		})

		return isValid
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		setHasSubmitted(true)

		if (validateForm()) {
			onSubmit(formData)
		}
	}

	const handleCancel = () => {
		navigate(-1)
	}

	const getFieldError = (fieldName) => {
		return hasSubmitted && touched[fieldName] && errors[fieldName] && errors[fieldName].length > 0 ? errors[fieldName][0] : null
	}

	return (
		<form onSubmit={handleSubmit} className='snippet-form'>
			<div className='form-group'>
				<label htmlFor='title' className='form-label'>
					Title *
				</label>
				<input type='text' id='title' name='title' value={formData.title} onChange={handleInputChange} onBlur={handleBlur} className={`form-input ${getFieldError('title') ? 'error' : ''}`} placeholder='Enter a descriptive title for your snippet' disabled={loading} maxLength={200} />
				{getFieldError('title') && <span className='error-message'>{getFieldError('title')}</span>}
				<div className='character-count'>{formData.title.length}/200</div>
			</div>

			<div className='form-group'>
				<label htmlFor='htmlContent' className='form-label'>
					HTML Content *
				</label>
				<textarea id='htmlContent' name='htmlContent' value={formData.htmlContent} onChange={handleInputChange} onBlur={handleBlur} className={`form-textarea ${getFieldError('htmlContent') ? 'error' : ''}`} placeholder='Paste your HTML code here...' disabled={loading} rows={12} />
				{getFieldError('htmlContent') && <span className='error-message'>{getFieldError('htmlContent')}</span>}
			</div>

			<div className='form-group'>
				<label htmlFor='tags' className='form-label'>
					Tags (Labels)
				</label>
				<div className='tags-input-container'>
					<input type='text' id='tags' value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={handleTagInputKeyPress} placeholder='Add a tag and press Enter...' className='form-input' maxLength={50} />
					<button type='button' onClick={handleAddTag} className='add-tag-button' disabled={!tagInput.trim() || formData.tags.length >= 10}>
						Add
					</button>
				</div>

				{formData.tags.length > 0 && (
					<div className='tags-display'>
						{formData.tags.map((tag, index) => (
							<span key={index} className='tag-chip'>
								{tag}
								<button type='button' onClick={() => handleRemoveTag(tag)} className='tag-remove' aria-label={`Remove ${tag} tag`}>
									×
								</button>
							</span>
						))}
					</div>
				)}

				<div className='tags-help'>{formData.tags.length}/10 tags • Press Enter or click Add to add tags</div>

				{getFieldError('tags') && <span className='error-message'>{getFieldError('tags')}</span>}
			</div>

			<div className='form-actions'>
				<LoadingButton type='button' variant='secondary' onClick={handleCancel} disabled={loading}>
					Cancel
				</LoadingButton>
				<LoadingButton type='submit' loading={loading} loadingText='Creating...' variant='primary' size='medium'>
					Create Snippet
				</LoadingButton>
			</div>
		</form>
	)
}

export default SnippetForm
