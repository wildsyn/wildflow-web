/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { speechSegments, speechSegmentAudio } from '../api'

export function LiveSpeech({ job, done }: { job: string; done: boolean }) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [count, setCount] = useState(0)
  const finished = useRef(done)
  finished.current = done
  const audio = useRef<AudioContext | null>(null)
  useEffect(() => {
    if (!playing) return
    const context = audio.current
    if (!context) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let nextStart = 0
    let attempt = ''
    const seen = new Set<string>()
    const sources = new Set<AudioBufferSourceNode>()
    async function poll(context: AudioContext) {
      try {
        const doneBeforeFetch = finished.current
        const segments = await speechSegments(job)
        if (stopped) return
        if (segments.length && attempt && segments[0].attempt_id !== attempt) {
          for (const source of sources) source.stop()
          sources.clear()
          seen.clear()
          nextStart = 0
        }
        if (segments.length) attempt = segments[0].attempt_id
        for (const segment of segments) {
          if (seen.has(segment.segment_id)) continue
          const data = await speechSegmentAudio(job, segment.segment_id)
          if (stopped) return
          const buffer = await context.decodeAudioData(data)
          if (stopped) return
          const source = context.createBufferSource()
          source.buffer = buffer
          source.connect(context.destination)
          nextStart = Math.max(nextStart, context.currentTime + 0.05)
          sources.add(source)
          source.addEventListener('ended', () => sources.delete(source), {
            once: true,
          })
          source.start(nextStart)
          nextStart += buffer.duration
          seen.add(segment.segment_id)
          setCount(seen.size)
        }
        if (!doneBeforeFetch && !stopped) {
          timer = setTimeout(() => void poll(context), 500)
        }
      } catch {
        if (!stopped) {
          setFailed(true)
          setPlaying(false)
        }
      }
    }
    void poll(context)
    return () => {
      stopped = true
      clearTimeout(timer)
      for (const source of sources) source.stop()
    }
  }, [job, playing])
  useEffect(
    () => () => {
      void audio.current?.close()
    },
    []
  )
  async function play() {
    try {
      audio.current ??= new AudioContext()
      await audio.current.resume()
      setFailed(false)
      setCount(0)
      setPlaying(true)
    } catch {
      setFailed(true)
    }
  }
  return (
    <div className='space-y-2'>
      <Button
        type='button'
        variant='outline'
        onClick={() => (playing ? setPlaying(false) : void play())}
      >
        {playing ? t('Stop listening') : t('Listen while generating')}
      </Button>
      <p className='text-muted-foreground text-xs'>
        {t('Audio segments loaded')}: {count}
      </p>
      {failed && (
        <p role='alert'>
          {t(
            'Live playback failed. You can retry or download the completed WAV.'
          )}
        </p>
      )}
    </div>
  )
}
