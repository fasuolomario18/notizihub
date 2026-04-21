import LangArticle from '../../../components/LangArticle';
import { getLangArticlePaths, getLangArticleProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangArticlePaths('es');
}

export async function getStaticProps({ params }) {
  return getLangArticleProps('es', params);
}

export default function ArticlePage(props) {
  return <LangArticle {...props} lang="es" />;
}
