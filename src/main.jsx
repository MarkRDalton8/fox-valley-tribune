import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
import ArticleDetail from './pages/ArticleDetail'
import Subscribe from './pages/Subscribe'
import AccountPage from './pages/AccountPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/news" element={<SectionPage />} />
        <Route path="/sports" element={<SectionPage />} />
        <Route path="/opinion" element={<SectionPage />} />
        <Route path="/news/:slug" element={<ArticleDetail />} />
        <Route path="/sports/:slug" element={<ArticleDetail />} />
        <Route path="/opinion/:slug" element={<ArticleDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
