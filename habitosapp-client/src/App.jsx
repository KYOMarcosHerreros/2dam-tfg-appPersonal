import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <h1>HabitosApp - Frontend funcionando!</h1>
        </header>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div>
      <h2>¡El frontend está funcionando!</h2>
      <p>Backend URL: {import.meta.env.VITE_API_URL || 'No configurada'}</p>
      <a href="/test">Ir a Test</a>
    </div>
  )
}

function Test() {
  return (
    <div>
      <h2>Página de Test</h2>
      <a href="/">Volver al inicio</a>
    </div>
  )
}

export default App