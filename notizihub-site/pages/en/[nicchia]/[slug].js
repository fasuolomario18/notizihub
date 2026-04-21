import LangArticle from '../../../components/LangArticle';
import { getLangArticlePaths, getLangArticleProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangArticlePaths('en');
}

export async function getStaticProps({ params }) {
  return getLangArticleProps('en', params);
}

export default function ArticlePage(props) {
  return <LangArticle {...props} lang="en" />;
}
