import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

function App() {
  return (
    <div className="app">
      <div className="page-container">
        <div className="text-center" style={{ paddingTop: '20vh' }}>
          <h1 className="mb-3" style={{ fontSize: '3rem' }}>
            <span className="text-accent-purple">NEON</span>{' '}
            <span className="text-accent-blue">HUB</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            Your personal media tracking platform
          </p>
          <p className="text-muted mt-4" style={{ fontSize: '0.9rem' }}>
            Phase 1 — Project scaffolding complete. Features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
