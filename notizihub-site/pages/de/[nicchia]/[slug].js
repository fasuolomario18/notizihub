import LangArticle from '../../../components/LangArticle';
import { getLangArticlePaths, getLangArticleProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangArticlePaths('de');
}

export async function getStaticProps({ params }) {
  return getLangArticleProps('de', params);
}

export default function ArticlePage(props) {
  return <LangArticle {...props} lang="de" />;
}
