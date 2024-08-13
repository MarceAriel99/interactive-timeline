import React from 'react';
import './css/index.css';
import { AuthProvider } from './components/AuthProvider';
import { DatabaseProvider } from './components/DatabaseContext';
import App from './routes/App';
import EventsCRUD from './routes/EventsCRUD';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
  },
  {
    path: "eventsCRUD",
    element: <EventsCRUD />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  /*<React.StrictMode>*/
    <AuthProvider>
      <DatabaseProvider>
        <RouterProvider router={router} />
      </DatabaseProvider>
    </AuthProvider>
  /*</React.StrictMode>*/
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
