import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoordinatorPage } from './pages/CoordinatorPage';
import { DesignSystemShowcase } from './components/design-system/DesignSystemShowcase';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-antah-ivory text-antah-navy selection:bg-antah-teal/20 selection:text-antah-teal-hover">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/coordinator" element={<CoordinatorPage />} />
            <Route path="/design-system" element={<DesignSystemShowcase />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
