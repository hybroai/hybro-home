import { InstallCard, type InstallOption } from './install-card'

// The CLI installs as an isolated tool; the SDK goes into the project's virtualenv.
const OPTIONS: InstallOption[] = [
  { key: 'uv', label: 'uv', lines: ['uv tool install a2a-adapter'] },
  { key: 'pipx', label: 'pipx', lines: ['pipx install a2a-adapter'] },
  { key: 'pip', label: 'pip', lines: ['pip install a2a-adapter'] },
]

export function AdapterInstall() {
  return (
    <div style={{ width: '100%', maxWidth: 640, marginBottom: 36 }}>
      <InstallCard id="adapter-install" options={OPTIONS} large />
    </div>
  )
}
