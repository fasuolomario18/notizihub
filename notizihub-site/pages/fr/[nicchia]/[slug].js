import LangArticle from '../../../components/LangArticle';
import { getLangArticlePaths, getLangArticleProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangArticlePaths('fr');
}

export async function getStaticProps({ params }) {
  return getLangArticleProps('fr', params);
}

export default function ArticlePage(props) {
  return <LangArticle {...props} lang="fr" />;
}
