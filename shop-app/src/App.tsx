import TopBar from "./components/app-bar/TopBar";
import Store from "./components/store/Store";

function App() {
  return (
    <>
      <header className="sticky top-0 z-10">
        <TopBar />
      </header>
      <main className="m-2">
        <Store />
      </main>
    </>
  );
}

export default App;
