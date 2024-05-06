import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userSlice from './redux/userSlice'
import channelSlice from './redux/channelSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

const store = configureStore({
  reducer: {
    userSlice,
    channelSlice,
  },
})
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
)

const state = store.getState()
export const useOwnSelector: TypedUseSelectorHook<typeof state> = useSelector
export const useOwnDispatch: () => typeof store.dispatch = useDispatch
