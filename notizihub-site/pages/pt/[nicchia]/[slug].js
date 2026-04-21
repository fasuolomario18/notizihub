import LangArticle from '../../../components/LangArticle';
import { getLangArticlePaths, getLangArticleProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangArticlePaths('pt');
}

export async function getStaticProps({ params }) {
  return getLangArticleProps('pt', params);
}

export default function ArticlePage(props) {
  return <LangArticle {...props} lang="pt" />;
}
