'use client'
import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import TitleDes from '../common/TitleDes'

const VideoCard = ({ videoId, title, description }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="w-full max-w-7xl mx-auto rounded-md overflow-hidden  dark:bg-card border border-gray-200 dark:border-border shadow-sm hover:shadow-xl transition-all duration-300 group">
  
  <div className="relative aspect-[16/7] cursor-pointer overflow-hidden" onClick={() => setIsPlaying(true)}>

      {!isPlaying ? (
        <>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
            <div className="bg-white p-3 rounded-md shadow-md">
              <FaPlay className=" dark:text-red-500 text-gray-800 text-xl" />
            </div>
          </div>
        </>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
    <div className="p-5">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
  
  )
}

const VideoPreviewSection = () => {
  const video = {
    videoId: 'tLYSSf7C0_w',
    title: 'Mr. Abdur Rahman’s Grocery Store',
    description: '“Bishwasto POS helped me manage my stock & sales with ease.”',
  }

  return (
    <section className="py-16 container px-4 mx-auto  text-foreground w-full">
      <div className="">
        <TitleDes title={'See Bishwasto in Action'} description={'Watch how Bishwasto POS transforms businesses.'} />
        <VideoCard {...video} />
      </div>
    </section>
  )
}

export default VideoPreviewSection
