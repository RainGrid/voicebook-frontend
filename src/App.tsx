import './App.css';
import RecordPanel from './components/RecordPanel';
import RecordsList from './components/RecordsList';
import TopPanel from './components/TopPanel';
import TotalRecords from './components/TotalRecords';

function App() {
  return (
    <div className="app">
      <TopPanel />
      <main className="main">
        <TotalRecords />
        <RecordsList />
      </main>
      <RecordPanel />
    </div>
  );
}

export default App;
