import './App.css'
import Dices from './Dices';

function App() {
  const handleReload = () => {
    // This triggers a full page reload using the browser's built-in functionality.
    window.location.reload(); // Passing 'true' forces the page to reload from the server, not the browser cache.
  };

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1 className="text-3xl font-bold underline text-blue-600">
        DM Prep v0.0.2
      </h1>
      <Dices />
      <button onClick={handleReload} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Reload Page
      </button>
    </>
  )
}

export default App
