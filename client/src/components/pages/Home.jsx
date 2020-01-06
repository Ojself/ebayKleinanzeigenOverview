import React, { useEffect, useState } from 'react'
import api from '../../api'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(true)
      api
        .getArticles()
        .then(articles => {
          console.log(articles)
          if (articles.message) {
            setMessage(articles.message)
          } else {
            setArticles(articles.body)
          }
          setLoading(false)
        })
        .catch(err => console.log(err))
    }, 1000 * 45)
    return () => clearInterval(interval)
  }, [])

  const articleComponent = loading ? (
    <p>Fetching data..</p>
  ) : (
    <div className="article-container">
      {articles.map((el, i) => (
        <div key={i} className="article">
          <img src={el.img} alt="" />
          <div className="article-info">
            <h2>{el.title}</h2>
            <h1>{el.price}</h1>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="">
      <h2>{message || ''}</h2>
      {articleComponent}
    </div>
  )
}
