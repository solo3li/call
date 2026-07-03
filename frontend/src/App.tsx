import { useState, useCallback } from 'react'
import { LiveKitRoom, useRoomContext, AudioConference } from '@livekit/components-react'
// @ts-ignore
import '@livekit/components-styles'
import { Phone, PhoneOff, User, Hash } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || '';
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || '';

function App() {
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState('call-100')
  const [userName, setUserName] = useState('web-user')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')

  const handleConnect = async () => {
    setIsConnecting(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/token?room=${roomName}&participantName=${userName}`)
      if (!response.ok) throw new Error('Failed to fetch token')
      const data = await response.json()
      setToken(data.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = useCallback(() => {
    setToken('')
  }, [])

  if (token === '') {
    return (
      <div className="glass-container">
        <h1 className="title">SIP Bridge Call</h1>
        <p className="subtitle">Connect to Issabel PBX via LiveKit</p>
        
        <div className="input-group">
          <div style={{ position: 'relative' }}>
            <Hash size={18} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '100%', paddingLeft: '44px', boxSizing: 'border-box' }}
              value={roomName} 
              onChange={e => setRoomName(e.target.value)} 
              placeholder="Room Name (e.g. call-100)"
            />
          </div>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', top: '16px', left: '16px', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '100%', paddingLeft: '44px', boxSizing: 'border-box' }}
              value={userName} 
              onChange={e => setUserName(e.target.value)} 
              placeholder="Your Name"
            />
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}

        <button 
          className="btn-primary" 
          onClick={handleConnect} 
          disabled={isConnecting}
        >
          <Phone size={20} />
          {isConnecting ? 'Connecting...' : 'Join Call'}
        </button>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={LIVEKIT_URL}
      onDisconnected={handleDisconnect}
      data-lk-theme="default"
    >
      <div className="glass-container">
        <div className="call-container">
          <h2 className="title">{roomName}</h2>
          <div className="status-badge">
            <div className="status-dot"></div>
            Connected
          </div>
          
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <AudioConference />
          </div>

          <DisconnectButton />
        </div>
      </div>
    </LiveKitRoom>
  )
}

function DisconnectButton() {
  const room = useRoomContext()
  return (
    <button className="btn-primary btn-danger" onClick={() => room.disconnect()}>
      <PhoneOff size={20} />
      End Call
    </button>
  )
}

export default App
