import { Provider } from "react-redux";
import "./App.css";
import Store from "./components/store/Store";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <Store />
    </Provider>
  );
}

export default App;
