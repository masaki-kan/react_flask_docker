import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import AppRoutes from "./route/appRoutes";
import { Suspense } from "react";

function App() {
  return (
    <ChakraProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<Spinner />}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </Suspense>
        </PersistGate>
      </Provider>
    </ChakraProvider>
  );
}

export default App;
