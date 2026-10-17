import {
  CrewAIIcon,
  LangChainIcon,
  LangGraphIcon,
  N8nIcon,
  OllamaIcon,
  OpenClawIcon,
  PiIcon,
} from './icons'

export type LogoName =
  | 'claude'
  | 'codex'
  | 'pi'
  | 'openclaw'
  | 'hermes'
  | 'n8n'
  | 'langgraph'
  | 'langchain'
  | 'crewai'
  | 'ollama'
  | 'omp'
  | 'muse'
  | 'deepseek'

const VECTOR = {
  pi: PiIcon,
  openclaw: OpenClawIcon,
  n8n: N8nIcon,
  langgraph: LangGraphIcon,
  langchain: LangChainIcon,
  crewai: CrewAIIcon,
  ollama: OllamaIcon,
}

/** A framework logo at `size` px, drawn in the light text color. */
export function FrameworkLogo({ name, size }: { name: LogoName; size: number }) {
  // Full-color marks served as files: Claude from simple-icons (CC0), Codex from
  // LobeHub icons (MIT), omp, Muse (Meta) and DeepSeek from their official sites,
  // Hermes as in the Hybro app.
  if (name === 'claude' || name === 'codex' || name === 'omp' || name === 'muse' || name === 'deepseek') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small static logo
      <img src={`/logos/${name}.svg`} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain' }} />
    )
  }
  if (name === 'hermes') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny raster mark; no official vector
      <img
        src="/logos/hermes.png"
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain', filter: 'invert(1)' }}
      />
    )
  }
  const Icon = VECTOR[name]
  return (
    <span aria-hidden="true" style={{ display: 'flex', width: size, height: size, color: '#E3E6EB' }}>
      <Icon className="site-logo-svg" />
    </span>
  )
}

/** A short text mark for agents without a logo, such as Claude Code (CC). */
export function TextMark({ mark, color, size }: { mark: string; color: string; size: number }) {
  return (
    <span className="mono" style={{ fontSize: size, fontWeight: 700, color }}>
      {mark}
    </span>
  )
}
