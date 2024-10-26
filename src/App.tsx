import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux";
import { Kernel } from "./components/system/Kernel";
import "./scss/main.scss";

function App() {
  return (
    <Provider store={store}>
      <Kernel />
    </Provider>
  );
}

export default App;
