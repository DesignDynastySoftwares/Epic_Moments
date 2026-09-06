import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const KeywordPage = () => {
  const { slug } = useParams();
  const [keyword, setKeyword] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchKeyword = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/keyword/${slug}`);
        if (response.data.success) {
          setKeyword(response.data.keyword);
        }
      } catch (err) {
        console.error("Keyword fetch error:", err);
      }
    };

    fetchKeyword();
  }, [slug]);

  if (!keyword) return <p className="p-4">Loading...</p>;

  return (
    <>
      <Helmet>
        {/* SEO Meta Tags */}
        <title>{keyword.keyword}</title>
        <meta name="description" content={keyword.description} />
        <meta name="keywords" content={keyword.keyword} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://myepicmoments.com/keyword/${keyword.slug}`} />

        {/* Open Graph / Facebook / LinkedIn */}
        <meta property="og:title" content={keyword.keyword} />
        <meta property="og:description" content={keyword.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://myepicmoments.com/keyword/${keyword.slug}`} />
        <meta property="og:image" content="https://myepicmoments.com/default-og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={keyword.keyword} />
        <meta name="twitter:description" content={keyword.description} />
        <meta name="twitter:image" content="https://myepicmoments.com/default-og-image.jpg" />
      </Helmet>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">{keyword.keyword}</h1>
        <div dangerouslySetInnerHTML={{ __html: keyword.content }} />
      </div>
    </>
  );
};

export default KeywordPage;
