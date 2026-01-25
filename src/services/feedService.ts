import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface Episode {
  id: string
  title: string
  description: string
  pubDate: string
  audioUrl: string
  duration?: number
  episodeNumber?: string
}

export interface PodcastFeed {
  title: string
  description: string
  episodes: Episode[]
  lastUpdated: number
}

interface CacheDB extends DBSchema {
  feed: {
    key: 'podcastFeed'
    value: PodcastFeed
  }
}

let db: IDBPDatabase<CacheDB> | null = null

async function getDB(): Promise<IDBPDatabase<CacheDB>> {
  if (db) return db

  db = await openDB<CacheDB>('sternengeschichten', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('feed')) {
        db.createObjectStore('feed')
      }
    }
  })

  return db
}

export async function fetchPodcastFeed(): Promise<PodcastFeed> {
  const feedUrl = 'https://sternengeschichten.podigee.io/feed/mp3'
  
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    const feed = parseFeed(text)

    // Cache the feed
    const database = await getDB()
    await database.put('feed', {
      ...feed,
      lastUpdated: Date.now()
    }, 'podcastFeed')

    return feed
  } catch (error) {
    console.error('Error fetching feed:', error)
    // Try to return cached version
    const database = await getDB()
    const cached = await database.get('feed', 'podcastFeed')
    if (cached) {
      return cached
    }
    throw error
  }
}

export async function getCachedFeed(): Promise<PodcastFeed | null> {
  try {
    const database = await getDB()
    return await database.get('feed', 'podcastFeed') || null
  } catch {
    return null
  }
}

function parseFeed(xmlText: string): PodcastFeed {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  if (xmlDoc.documentElement.nodeName === 'parsererror') {
    throw new Error('Failed to parse XML feed')
  }

  const channel = xmlDoc.querySelector('channel')
  if (!channel) throw new Error('No channel found in feed')

  const title = channel.querySelector('title')?.textContent || 'Sternengeschichten'
  const description = channel.querySelector('description')?.textContent || ''

  const items = Array.from(channel.querySelectorAll('item'))
  const episodes: Episode[] = items
    .map((item, index) => {
      const itemTitle = item.querySelector('title')?.textContent || ''
      const itemDescription = item.querySelector('description')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent || ''
      const enclosure = item.querySelector('enclosure')
      const audioUrl = enclosure?.getAttribute('url') || ''
      const duration = item.querySelector('duration')?.textContent

      // Extract episode number from iTunes namespace first, then fallback to title
      const itunesEpisode = item.querySelector('episode')?.textContent
      const episodeNumber = itunesEpisode || ''

      return {
        id: `ep-${episodeNumber}`,
        title: itemTitle,
        description: itemDescription,
        pubDate,
        audioUrl,
        duration: duration ? parseInt(duration) : undefined,
        episodeNumber
      }
    })
    .filter(ep => ep.audioUrl) // Only include episodes with audio
    .reverse() // Most recent first

  return {
    title,
    description,
    episodes,
    lastUpdated: Date.now()
  }
}
