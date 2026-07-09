import { useEffect, useState } from 'react'
import type { CourseContent } from '@/services/backend'
import { fetchContent } from '@/services/backend'
import { is401 } from '@/utils/helpers/http'

export function useContentData(token: string, onUnauthorized: () => void) {
  const [content, setContent] = useState<CourseContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)

  const loadContent = async () => {
    try {
      setContent(await fetchContent(token))
    } catch (e) {
      if (is401(e)) onUnauthorized()
    } finally {
      setLoadingContent(false)
    }
  }

  useEffect(() => {
    void loadContent()
  }, [])

  return { content, loadContent, loadingContent, setContent }
}
