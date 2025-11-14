import express from 'express'
import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

app.use(express.json())

// Serve static files from ideas directory
app.use('/ideas', express.static(join(__dirname, 'ideas')))

// API endpoint to list ideas
app.get('/api/ideas', async (req, res) => {
  try {
    const ideasDir = join(__dirname, 'ideas')
    const files = await readdir(ideasDir)
    const ideas = []

    for (const file of files) {
      const filePath = join(ideasDir, file)
      const stats = await stat(filePath)
      
      if (stats.isFile()) {
        const ext = extname(file).toLowerCase()
        if (ext === '.md' || ext === '.txt') {
          const content = await readFile(filePath, 'utf-8')
          const name = file.replace(ext, '')
          const description = content.split('\n').slice(0, 3).join(' ').substring(0, 150)
          
          ideas.push({
            name,
            description,
            url: `/ideas/${file}`,
            file
          })
        }
      }
    }

    res.json(ideas)
  } catch (error) {
    console.error('Error reading ideas:', error)
    res.json([])
  }
})

// API endpoint to get a single idea file content
app.get('/api/ideas/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = join(__dirname, 'ideas', filename)
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }
    
    const content = await readFile(filePath, 'utf-8')
    res.json({ content, filename })
  } catch (error) {
    console.error('Error reading idea file:', error)
    res.status(404).json({ error: 'File not found' })
  }
})

// API endpoint to update an idea file
app.put('/api/ideas/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const { content } = req.body
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }
    
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }
    
    const filePath = join(__dirname, 'ideas', filename)
    await writeFile(filePath, content, 'utf-8')
    
    res.json({ success: true, message: 'File updated successfully' })
  } catch (error) {
    console.error('Error updating idea file:', error)
    res.status(500).json({ error: 'Failed to update file' })
  }
})

// API endpoint to create a new idea file
app.post('/api/ideas', async (req, res) => {
  try {
    const { filename, content } = req.body
    
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' })
    }
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }
    
    // Ensure filename has .md extension
    const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`
    
    // Check if file already exists
    const filePath = join(__dirname, 'ideas', finalFilename)
    try {
      await stat(filePath)
      return res.status(400).json({ error: 'File already exists' })
    } catch (error) {
      // File doesn't exist, which is what we want
    }
    
    // Write the file with provided content or default content
    const fileContent = content || `# ${filename.replace('.md', '')}\n\n## Overview\n\n## Problem Statement\n\n## Solution\n\n## Features\n\n## Next Steps\n`
    await writeFile(filePath, fileContent, 'utf-8')
    
    res.json({ success: true, message: 'Idea created successfully', filename: finalFilename })
  } catch (error) {
    console.error('Error creating idea file:', error)
    res.status(500).json({ error: 'Failed to create file' })
  }
})

// API endpoint to create a new prototype
app.post('/api/prototypes', async (req, res) => {
  try {
    const { name } = req.body
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Prototype name is required' })
    }
    
    // Security: prevent directory traversal and invalid characters
    if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes(':')) {
      return res.status(400).json({ error: 'Invalid prototype name' })
    }
    
    // Create prototype directory
    const prototypeDir = join(__dirname, 'prototypes', name.trim())
    try {
      await mkdir(prototypeDir, { recursive: false })
    } catch (error) {
      if (error.code === 'EEXIST') {
        return res.status(400).json({ error: 'Prototype already exists' })
      }
      throw error
    }
    
    // Create a README.md file with basic instructions
    const readmePath = join(prototypeDir, 'README.md')
    const readmeContent = `# ${name.trim()}\n\n## Getting Started\n\nAdd your prototype code here. This directory is your starting point for building this prototype.\n\n## Running the Prototype\n\nAdd instructions here on how to run your prototype (e.g., npm install, npm start, etc.)\n`
    await writeFile(readmePath, readmeContent, 'utf-8')
    
    res.json({ success: true, message: 'Prototype created successfully', name: name.trim() })
  } catch (error) {
    console.error('Error creating prototype:', error)
    res.status(500).json({ error: 'Failed to create prototype' })
  }
})

// API endpoint to list prototypes
app.get('/api/prototypes', async (req, res) => {
  try {
    const prototypesDir = join(__dirname, 'prototypes')
    const files = await readdir(prototypesDir)
    const prototypes = []

    for (const file of files) {
      const filePath = join(prototypesDir, file)
      const stats = await stat(filePath)
      
      if (stats.isDirectory()) {
        // Check if it has an index.html or package.json (indicates it's a runnable app)
        let hasIndex = false
        let hasPackageJson = false
        try {
          const dirContents = await readdir(filePath)
          hasIndex = dirContents.includes('index.html')
          hasPackageJson = dirContents.includes('package.json')
        } catch (error) {
          // Directory might be empty or inaccessible
        }
        
        prototypes.push({
          name: file,
          path: `/prototypes/${file}/`,
          hasIndex,
          hasPackageJson
        })
      }
    }

    res.json(prototypes)
  } catch (error) {
    console.error('Error reading prototypes:', error)
    res.json([])
  }
})

// Serve prototype directories (for opening index.html if it exists)
app.use('/prototypes', express.static(join(__dirname, 'prototypes')))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

