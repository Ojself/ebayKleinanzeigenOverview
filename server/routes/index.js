const express = require('express')
const router = express.Router()
const axios = require('axios')

router.get('/articles', async (req, res) => {
  let message = null
  const response = await getArticlesFromKleinan()
  if (!response) {
    message = 'Something went wrong with external API'
  }

  res.status(200).json({
    body: response,
    message,
  })
})

async function getArticlesFromKleinan() {
  const headers = {
    // this might change when session is destroyed
    cookie:
      'ekcmpSeen=true; overlayV21=seen; ekConsentData=BOoDdVpOoDdVpB9ChBDECh-AAAAp57v______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-3zd4u_1vf99yfm1-7etr3tp_87ues2_Xur__79__3z3_9phP78k89r7337Ew-v83oA; ekConsentBucket=full; ekCustomConsentData=42%2C43; wl=%7B%22l%22%3A%22%22%7D; uh=%7B%22sh%22%3A%22l%3D3353%26c%3D80%3A%3Al%3D3331%26c%3D216%26map%3D1000%3A%3Al%3D3353%26c%3D210%3A%3Al%3D3353%26k%3Dbouncing%2520castle%3A%3Al%3D3353%26sf%3DRELEVANCY%26c%3D185%22%7D; sc=%7B%22va%22%3A%221291368746%2C2616967%22%7D; JSESSIONID=8042AF0FE3A159EC8B549C6B3738CFFB-mc4.koeb46-25_i01_1001; up=%7B%22ln%22%3A%22745727750%22%2C%22ls%22%3A%22l%3D3353%26c%3D80%22%2C%22va%22%3A%221272797649%2C-24184984%2C24249144%2C101169%2C91682%2C-24956%2C62089%2C-1581%2C-6183%2C-2930%2C-19555055%2C37545564%2C126%2C461%2C-988%2C-16485881%2C-1816726%2C20485521%2C-1885375%2C2616967%22%2C%22vapwrnscrty%22%3A1%2C%22r%22%3A%2231%22%7D',
  }
  const request = await axios.get(
    'https://www.ebay-kleinanzeigen.de/s-10247/l3353r3', // last digit says how many kilometer radius.
    headers
  )

  // heavy regexing to get the correct data
  const massagedData = await dataMassager(request.data)
  return massagedData
}

async function dataMassager(data) {
  const regex = /<article class="aditem" data-adid="(.|\n)*?<\/article>/g

  // Strip out all the articles (n=27)
  const articles = data.match(regex)
  const result = []
  // Only gets articles between 2-8. The two first are ads and the rest are already seen
  for (let i = 2; i < 8; i++) {
    result.push({
      img: getImage(articles[i]),
      title: getTitle(articles[i]),
      price: getPrice(articles[i]),
    })
  }
  //console.log(result, 'res')
  return result
}

function getImage(article) {
  const regex = /data-imgsrcretina="https:(.|\n)*?"/gm

  let image = article.match(regex)
  if (image === null) {
    return 'https://i.picsum.photos/id/829/200/300.jpg'
  }
  return image.map(el => el.replace('data-imgsrcretina="', '').slice(0, -3))
}
function getTitle(article) {
  const regex = /data-imgtitle="(.|\n)*?"/g
  const regex2 = /<h2 class="text-module-begin">(.|\n)*?<\/a>/g
  let title = article.match(regex)
  // searching for the title..
  if (title === null) {
    title = article.match(regex2)
    if (title === null) {
      return ''
    }
    let splitted = title.join(' ').split('">')
    return splitted[2].slice(0, -4)
  }
  return title.map(el => el.replace('data-imgtitle="', '').slice(0, -1))
}
function getPrice(article) {
  const regex = /<strong>(.|\n)*?<\/strong>/gm
  let price = article.match(regex)
  if (price === null) {
    return 'no price'
  }
  return price.map(el => el.replace(/<\/?strong>/g, '').replace('VB', ''))
}

module.exports = router
