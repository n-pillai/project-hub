import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [ideas, setIdeas] = useState([])
  const [prototypes, setPrototypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingIdea, setEditingIdea] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddPrototypeModal, setShowAddPrototypeModal] = useState(false)

  useEffect(() => {
    // Fetch ideas and prototypes from the public directory
    fetchIdeas()
    fetchPrototypes()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas')
      if (response.ok) {
        const data = await response.json()
        setIdeas(data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    }
  }

  const fetchPrototypes = async () => {
    try {
      const response = await fetch('/api/prototypes')
      if (response.ok) {
        const data = await response.json()
        setPrototypes(data)
      }
    } catch (error) {
      console.error('Error fetching prototypes:', error)
    }
    setLoading(false)
  }

  const handleEditIdea = async (idea) => {
    try {
      const response = await fetch(`/api/ideas/${idea.file}`)
      if (response.ok) {
        const data = await response.json()
        setEditingIdea({ ...idea, content: data.content })
      } else {
        alert('Failed to load idea for editing')
      }
    } catch (error) {
      console.error('Error loading idea:', error)
      alert('Failed to load idea for editing')
    }
  }

  const handleSaveIdea = async (filename, content) => {
    try {
      const response = await fetch(`/api/ideas/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setEditingIdea(null)
        fetchIdeas() // Refresh the ideas list
        alert('Idea saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving idea:', error)
      alert('Failed to save idea')
    }
  }

  const handleCreateIdea = async (filename, content) => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content }),
      })

      if (response.ok) {
        setShowAddModal(false)
        fetchIdeas() // Refresh the ideas list
        alert('Idea created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating idea:', error)
      alert('Failed to create idea')
    }
  }

  const handleCreatePrototype = async (name) => {
    try {
      const response = await fetch('/api/prototypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setShowAddPrototypeModal(false)
        fetchPrototypes() // Refresh the prototypes list
        alert('Prototype directory created! You can now add your code to it.')
      } else {
        const error = await response.json()
        alert(`Failed to create: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating prototype:', error)
      alert('Failed to create prototype')
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Project Hub</h1>
        <p>Your collection of ideas and prototypes</p>
      </header>

      <div className="content">
        <section className="section">
          <div className="section-header">
            <h2>💡 Ideas & PRDs</h2>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              + New Idea
            </button>
          </div>
          <div className="section-docs">
            <p><strong>How it works:</strong> Ideas are markdown files stored in <code>ideas/</code>. Click <strong>"+ New Idea"</strong> to create one, <strong>"✏️ Edit"</strong> to modify, or <strong>"View →"</strong> to read the full content.</p>
          </div>
          <div className="grid">
            {ideas.length === 0 ? (
              <div className="empty-state">No ideas yet. Add some markdown files to the <code>ideas/</code> directory!</div>
            ) : (
              ideas.map((idea, index) => (
                <IdeaCard key={index} idea={idea} onEdit={handleEditIdea} />
              ))
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>⚡ Prototypes</h2>
            <button className="btn-add" onClick={() => setShowAddPrototypeModal(true)}>
              + New Prototype
            </button>
          </div>
          <div className="section-docs">
            <p><strong>How it works:</strong> Prototypes are code directories in <code>prototypes/</code>. Click <strong>"+ New Prototype"</strong> to create a directory, then add your code files. If you add an <code>index.html</code>, the tile shows a <span className="badge-inline">Live</span> badge and becomes clickable.</p>
          </div>
          <div className="grid">
            {prototypes.length === 0 ? (
              <div className="empty-state">No prototypes yet. Add some projects to the <code>prototypes/</code> directory!</div>
            ) : (
              prototypes.map((proto, index) => (
                <PrototypeCard key={index} prototype={proto} />
              ))
            )}
          </div>
        </section>
      </div>

      {editingIdea && (
        <EditModal
          idea={editingIdea}
          onClose={() => setEditingIdea(null)}
          onSave={handleSaveIdea}
        />
      )}

      {showAddModal && (
        <AddIdeaModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateIdea}
        />
      )}

      {showAddPrototypeModal && (
        <AddPrototypeModal
          onClose={() => setShowAddPrototypeModal(false)}
          onCreate={handleCreatePrototype}
        />
      )}
    </div>
  )
}

function IdeaCard({ idea, onEdit }) {
  return (
    <div className="card">
      <h3>{idea.name}</h3>
      {idea.description && <p className="description">{idea.description}</p>}
      <div className="card-footer">
        <button onClick={() => onEdit(idea)} className="btn-edit">
          ✏️ Edit
        </button>
        <a href={idea.url} target="_blank" rel="noopener noreferrer" className="link">
          View →
        </a>
      </div>
    </div>
  )
}

function EditModal({ idea, onClose, onSave }) {
  const [content, setContent] = useState(idea.content)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(idea.file, content)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit: {idea.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <textarea
            className="edit-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your idea content here..."
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddIdeaModal({ onClose, onCreate }) {
  const [filename, setFilename] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!filename.trim()) {
      alert('Please enter a filename')
      return
    }

    setCreating(true)
    await onCreate(filename.trim(), content)
    setCreating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Idea</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="filename">Filename (without .md extension)</label>
            <input
              id="filename"
              type="text"
              className="form-input"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="my-awesome-idea"
              disabled={creating}
            />
            <small className="form-hint">The file will be saved as {filename || 'filename'}.md</small>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content (optional)</label>
            <textarea
              id="content"
              className="edit-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your idea content here... (or leave blank for template)"
              disabled={creating}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={creating}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleCreate} disabled={creating || !filename.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddPrototypeModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Please enter a prototype name')
      return
    }

    setCreating(true)
    await onCreate(name.trim())
    setCreating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Prototype</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="prototype-name">Prototype Name</label>
            <input
              id="prototype-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-prototype"
              disabled={creating}
            />
            <small className="form-hint">A directory will be created in <code>prototypes/</code> where you can add your code</small>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={creating}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PrototypeCard({ prototype }) {
  const handleClick = (e) => {
    // If it has an index.html, open it; otherwise, just show the path
    if (prototype.hasIndex) {
      window.open(prototype.path, '_blank')
    } else {
      // For now, just open the directory path
      // In a real scenario, you might want to show a modal with instructions
      alert(`Prototype: ${prototype.name}\n\nPath: prototypes/${prototype.name}/\n\nAdd your code files here. If you add an index.html, it will be accessible via the link.`)
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="prototype-card-link"
      style={{ cursor: 'pointer' }}
    >
      <div className="card prototype-card">
        <h3>{prototype.name}</h3>
        {prototype.hasIndex && (
          <div className="prototype-badge">Live</div>
        )}
        <div className="prototype-arrow">→</div>
      </div>
    </div>
  )
}

export default App

