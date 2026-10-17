'use client'

import { useState } from 'react'
import { InstallCard, type InstallOption } from './install-card'

const OPTIONS: InstallOption[] = [
  { key: 'pip', label: 'PIP', shell: 'pip · macOS · Linux · Windows', prompt: true, body: 'pip install a2a-adapter', copy: 'pip install a2a-adapter' },
  { key: 'uv', label: 'UV', shell: 'uv · any virtualenv', prompt: true, body: 'uv pip install a2a-adapter', copy: 'uv pip install a2a-adapter' },
]

export function AdapterInstall() {
  const [tab, setTab] = useState('pip')
  return (
    <div style={{ width: '100%', maxWidth: 640, marginBottom: 36 }}>
      <InstallCard id="adapter-install" options={OPTIONS} value={tab} onChange={setTab} maxWidth={640} fontSize={15} />
    </div>
  )
}
