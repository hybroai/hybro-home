'use client'

import { useState } from 'react'
import { InstallCard, type InstallOption } from './install-card'

// The CLI installs as an isolated tool; the SDK goes into the project's virtualenv.
const OPTIONS: InstallOption[] = [
  { key: 'uv', label: 'UV', shell: 'uv · CLI tool', prompt: true, body: 'uv tool install a2a-adapter', copy: 'uv tool install a2a-adapter' },
  { key: 'pipx', label: 'PIPX', shell: 'pipx · CLI tool', prompt: true, body: 'pipx install a2a-adapter', copy: 'pipx install a2a-adapter' },
  { key: 'pip', label: 'PIP', shell: 'pip · SDK in a virtualenv', prompt: true, body: 'pip install a2a-adapter', copy: 'pip install a2a-adapter' },
]

export function AdapterInstall() {
  const [tab, setTab] = useState('uv')
  return (
    <div style={{ width: '100%', maxWidth: 640, marginBottom: 36 }}>
      <InstallCard id="adapter-install" options={OPTIONS} value={tab} onChange={setTab} maxWidth={640} fontSize={15} />
    </div>
  )
}
