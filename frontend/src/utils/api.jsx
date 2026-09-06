export const getKeywordBySlug = async (slug) => {
  const res = await fetch(`/api/keyword/${slug}`);
  const data = await res.json();
  return data.keyword;
};
