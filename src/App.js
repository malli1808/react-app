import './App.css';

function App() {
  return (
    <div className="App">
      <div>
        <label>First Name</label>
        <input name="firstName" />
      </div>
      <div>
        <label>Second Name</label>
        <input name='lastName' />
      </div>
      <div>
        <input type='submit' />
      </div>
    </div>
  );
}

export default App;
