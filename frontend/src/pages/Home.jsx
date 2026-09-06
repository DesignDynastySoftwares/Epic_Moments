import React from 'react'
import { Helmet } from 'react-helmet-async'
import NewLandingPage from '../components/NewLandingPage'

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>Epic Moments | Personalized Photo Gifts, Frames & Photography</title>
        <meta
          name="description"
          content="Epic Moments crafts personalized photo gifts, LED lamps, custom frames, sublimation pillows, car & desk decor, and professional wedding photography & albums. Made with love in Andhra Pradesh."
        />
        <meta
          name="keywords"
          content="personalized gifts, custom photo gifts, LED photo lamp, photo frames, sublimation pillow, custom stickers, wedding photography, photo albums, corporate gifts, birthday gifts, anniversary gifts, Epic Moments"
        />
        <link rel="canonical" href="https://myepicmoments.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myepicmoments.com/" />
        <meta property="og:title" content="Epic Moments | Personalized Photo Gifts & Photography" />
        <meta property="og:description" content="Personalized photo gifts, LED lamps, custom frames & professional photography. Turn your memories into something special." />
        <meta property="og:image" content="https://myepicmoments.com/assets/social-preview.jpg" />
        <meta property="og:site_name" content="Epic Moments" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Epic Moments | Personalized Photo Gifts & Photography" />
        <meta name="twitter:description" content="Personalized photo gifts, LED lamps, custom frames & professional photography." />
        <meta name="twitter:image" content="https://myepicmoments.com/assets/social-preview.jpg" />
      </Helmet>

      <NewLandingPage />
    </div>
  )
}

export default Home
