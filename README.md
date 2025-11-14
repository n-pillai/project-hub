# Project Hub

A simple hub to keep track of your project ideas and prototypes.

## Features

- 📝 **Ideas & PRDs**: Store your project ideas and product requirements documents in the `ideas/` directory
- ⚡ **Prototypes**: Keep track of your prototypes in the `prototypes/` directory
- 🎨 **Beautiful UI**: Clean, modern interface to browse your projects
- 🚀 **Easy to Use**: Just add markdown files to the directories and they'll show up automatically

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

1. Start the backend server (in one terminal):
```bash
npm run server
```

2. Start the frontend dev server (in another terminal):
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Adding Projects

### Adding Ideas/PRDs

Simply add markdown (`.md`) or text (`.txt`) files to the `ideas/` directory. The app will automatically:
- Extract the filename as the project name
- Use the first few lines as a description
- Make it clickable to view the full content

### Adding Prototypes

Create a directory in the `prototypes/` folder for each prototype. Each directory contains your prototype code/app that you're building locally.

Example:
```
prototypes/
└── my-prototype/
    ├── README.md
    ├── index.html  (optional - if present, the tile will link to it)
    └── ... (your code files)
```

- Click the **"+ New Prototype"** button to create a new prototype directory
- Add your code files to the directory
- If you add an `index.html`, the prototype tile will show a "Live" badge and link directly to it
- Otherwise, clicking the tile will show you the directory path
- Each prototype is a starting point for building your app

## Project Structure

```
project-hub/
├── ideas/              # Your project ideas and PRDs
├── prototypes/         # Your prototype projects
├── src/               # React app source code
├── server.js          # Express server for API
└── package.json       # Dependencies
```

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js
- **Styling**: CSS3 with modern gradients

## License

MIT

