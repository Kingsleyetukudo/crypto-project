import axios from "axios";

const normalizeCryptoCompareArticle = (article) => ({
  source: { name: article?.source_info?.name || article?.source || "CryptoCompare" },
  title: article?.title || "Untitled",
  description: article?.body || "",
  url: article?.url || "",
  urlToImage: article?.imageurl || "",
  publishedAt: article?.published_on
    ? new Date(article.published_on * 1000).toISOString()
    : null,
});

export const getCryptoNews = async (req, res) => {
  try {
    const apiKey = String(process.env.NEWSAPI_KEY || "")
      .split("#")[0]
      .trim();

    const { page, limit } = req.pagination;

    if (apiKey) {
      try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "crypto OR bitcoin OR ethereum",
            language: "en",
            sortBy: "publishedAt",
            pageSize: limit,
            page,
            apiKey,
          },
        });

        return res.json({
          items: response.data?.articles || [],
          total: response.data?.totalResults || 0,
          page,
          limit,
        });
      } catch {
        // Fall back to CryptoCompare below.
      }
    }

    const fallbackResponse = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", {
      params: {
        lang: "EN",
      },
    });

    const allItems = Array.isArray(fallbackResponse.data?.Data)
      ? fallbackResponse.data.Data
      : [];
    const start = (page - 1) * limit;
    const pageItems = allItems
      .slice(start, start + limit)
      .map(normalizeCryptoCompareArticle);

    return res.json({
      items: pageItems,
      total: allItems.length,
      page,
      limit,
    });
  } catch (error) {
    const upstreamStatus = error?.response?.status;
    const upstreamMessage =
      error?.response?.data?.message || error?.message || "Failed to fetch news";

    return res
      .status(upstreamStatus && Number.isInteger(upstreamStatus) ? upstreamStatus : 500)
      .json({ message: upstreamMessage });
  }
};
