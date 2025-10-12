import './App.css';
import RecordPanel from './components/RecordPanel';
import RecordsList from './components/RecordsList';
import TopPanel from './components/TopPanel';
import TotalRecords from './components/TotalRecords';
import { AppProvider } from './context/app.context';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <TopPanel />
        <main className="main">
          <TotalRecords />
          <RecordsList />
        </main>
        <RecordPanel />
      </div>
    </AppProvider>
  );
}

export default App;
