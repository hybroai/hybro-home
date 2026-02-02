import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const pathSegments = params.mdxPath ?? []
  const { metadata } = await importPage(pathSegments)
  return metadata ?? {}
}

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const pathSegments = params.mdxPath ?? []
  const result = await importPage(pathSegments)
  const { default: MDXContent, toc, metadata, sourceCode } = result
  const components = getMDXComponents({})
  const Wrapper = components?.wrapper

  if (!Wrapper) {
    return <MDXContent />
  }

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent />
    </Wrapper>
  )
}
