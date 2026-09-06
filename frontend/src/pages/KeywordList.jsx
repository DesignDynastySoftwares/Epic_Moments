import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const KeywordList = () => {
  const { keywords } = useContext(ShopContext);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">SEO Keywords</h2>
      {keywords.length === 0 ? (
        <p className="text-gray-500 text-center">No keywords found.</p>
      ) : (
        keywords.map((k) => (
          <div key={k._id} className="mb-6 border p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <Link
              to={`/keyword/${k.slug}`}
              className="text-xl text-blue-700 font-semibold hover:underline"
            >
              {k.keyword}
            </Link>
            <div
              className="mt-2 text-gray-800 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: k.content }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default KeywordList;
