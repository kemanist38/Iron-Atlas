import React from 'react'
import MapView from './components/MapView'

export default function App(){
  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <header style={{padding: '12px', background: '#222', color: 'white'}}>Iron Atlas — MVP</header>
      <main style={{flex: 1}}>
        <MapView />
      </main>
    </div>
  )
}
