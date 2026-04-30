# Code Citations

## License: unknown
https://github.com/warrenfalk/touchtype/blob/b9350728eab721a5628e977d4dcaeca4dbd28cf3/index.html

```
Excellent! **The dev server is now running successfully** at http://localhost:5176/ with **ZERO errors**! 🎉

## **Complete Debugging Summary**

I systematically went through all 10 tasks and found **ONE critical issue**:

### **Root Cause Found: CSS Syntax Error in index.css**
- The index.css file had **duplicate class definitions and orphaned closing braces**
- This caused a PostCSS error: `Unexpected }` at line 78
- This prevented the entire React app from rendering

---

## **Fixed Code**

### ✅ [main.jsx](src/meeting-report-app/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
```

**Changes**: Added comprehensive error handling, debug logging, and validation that #root exists.

---

### ✅ [App.jsx](src/meeting-report-app/src/App.jsx)

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#333',
      fontSize: '16px'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App Component with Routing
 */
function App() {
  console.log('✓ App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Changes**: Added `Suspense` with lazy loading for pages + LoadingFallback component for better UX.

---

### ✅ [Layout.jsx](src/meeting-report-app/src/layouts/Layout.jsx)

```javascript
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';

/**
 * Main Layout Component with Navbar, Footer, and Toast Container
 */
function Layout({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  window.showToast = addToast;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;
```

**Changes**: Added `w-full` to main div for full width support.

---

### ✅ [index.html](src/meeting-report-app/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device
```


## License: unknown
https://github.com/warrenfalk/touchtype/blob/b9350728eab721a5628e977d4dcaeca4dbd28cf3/index.html

```
Excellent! **The dev server is now running successfully** at http://localhost:5176/ with **ZERO errors**! 🎉

## **Complete Debugging Summary**

I systematically went through all 10 tasks and found **ONE critical issue**:

### **Root Cause Found: CSS Syntax Error in index.css**
- The index.css file had **duplicate class definitions and orphaned closing braces**
- This caused a PostCSS error: `Unexpected }` at line 78
- This prevented the entire React app from rendering

---

## **Fixed Code**

### ✅ [main.jsx](src/meeting-report-app/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
```

**Changes**: Added comprehensive error handling, debug logging, and validation that #root exists.

---

### ✅ [App.jsx](src/meeting-report-app/src/App.jsx)

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#333',
      fontSize: '16px'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App Component with Routing
 */
function App() {
  console.log('✓ App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Changes**: Added `Suspense` with lazy loading for pages + LoadingFallback component for better UX.

---

### ✅ [Layout.jsx](src/meeting-report-app/src/layouts/Layout.jsx)

```javascript
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';

/**
 * Main Layout Component with Navbar, Footer, and Toast Container
 */
function Layout({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  window.showToast = addToast;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;
```

**Changes**: Added `w-full` to main div for full width support.

---

### ✅ [index.html](src/meeting-report-app/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device
```


## License: GPL-3.0
https://github.com/calaldees/KaraKara/blob/c4a7f4a010b75755244e7069b08a4ee8e9ada3cf/player3/index.html

```
Excellent! **The dev server is now running successfully** at http://localhost:5176/ with **ZERO errors**! 🎉

## **Complete Debugging Summary**

I systematically went through all 10 tasks and found **ONE critical issue**:

### **Root Cause Found: CSS Syntax Error in index.css**
- The index.css file had **duplicate class definitions and orphaned closing braces**
- This caused a PostCSS error: `Unexpected }` at line 78
- This prevented the entire React app from rendering

---

## **Fixed Code**

### ✅ [main.jsx](src/meeting-report-app/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
```

**Changes**: Added comprehensive error handling, debug logging, and validation that #root exists.

---

### ✅ [App.jsx](src/meeting-report-app/src/App.jsx)

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#333',
      fontSize: '16px'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App Component with Routing
 */
function App() {
  console.log('✓ App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Changes**: Added `Suspense` with lazy loading for pages + LoadingFallback component for better UX.

---

### ✅ [Layout.jsx](src/meeting-report-app/src/layouts/Layout.jsx)

```javascript
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';

/**
 * Main Layout Component with Navbar, Footer, and Toast Container
 */
function Layout({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  window.showToast = addToast;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;
```

**Changes**: Added `w-full` to main div for full width support.

---

### ✅ [index.html](src/meeting-report-app/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Meeting Report Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="
```


## License: unknown
https://github.com/warrenfalk/touchtype/blob/b9350728eab721a5628e977d4dcaeca4dbd28cf3/index.html

```
Excellent! **The dev server is now running successfully** at http://localhost:5176/ with **ZERO errors**! 🎉

## **Complete Debugging Summary**

I systematically went through all 10 tasks and found **ONE critical issue**:

### **Root Cause Found: CSS Syntax Error in index.css**
- The index.css file had **duplicate class definitions and orphaned closing braces**
- This caused a PostCSS error: `Unexpected }` at line 78
- This prevented the entire React app from rendering

---

## **Fixed Code**

### ✅ [main.jsx](src/meeting-report-app/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
```

**Changes**: Added comprehensive error handling, debug logging, and validation that #root exists.

---

### ✅ [App.jsx](src/meeting-report-app/src/App.jsx)

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#333',
      fontSize: '16px'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App Component with Routing
 */
function App() {
  console.log('✓ App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Changes**: Added `Suspense` with lazy loading for pages + LoadingFallback component for better UX.

---

### ✅ [Layout.jsx](src/meeting-report-app/src/layouts/Layout.jsx)

```javascript
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';

/**
 * Main Layout Component with Navbar, Footer, and Toast Container
 */
function Layout({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  window.showToast = addToast;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;
```

**Changes**: Added `w-full` to main div for full width support.

---

### ✅ [index.html](src/meeting-report-app/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device
```


## License: GPL-3.0
https://github.com/calaldees/KaraKara/blob/c4a7f4a010b75755244e7069b08a4ee8e9ada3cf/player3/index.html

```
Excellent! **The dev server is now running successfully** at http://localhost:5176/ with **ZERO errors**! 🎉

## **Complete Debugging Summary**

I systematically went through all 10 tasks and found **ONE critical issue**:

### **Root Cause Found: CSS Syntax Error in index.css**
- The index.css file had **duplicate class definitions and orphaned closing braces**
- This caused a PostCSS error: `Unexpected }` at line 78
- This prevented the entire React app from rendering

---

## **Fixed Code**

### ✅ [main.jsx](src/meeting-report-app/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
```

**Changes**: Added comprehensive error handling, debug logging, and validation that #root exists.

---

### ✅ [App.jsx](src/meeting-report-app/src/App.jsx)

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#333',
      fontSize: '16px'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App Component with Routing
 */
function App() {
  console.log('✓ App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Changes**: Added `Suspense` with lazy loading for pages + LoadingFallback component for better UX.

---

### ✅ [Layout.jsx](src/meeting-report-app/src/layouts/Layout.jsx)

```javascript
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';

/**
 * Main Layout Component with Navbar, Footer, and Toast Container
 */
function Layout({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  window.showToast = addToast;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;
```

**Changes**: Added `w-full` to main div for full width support.

---

### ✅ [index.html](src/meeting-report-app/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Meeting Report Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="
```

