import LangNicchia from '../../../components/LangNicchia';
import { getLangNicchiaPaths, getLangNicchiaProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangNicchiaPaths('fr');
}

export async function getStaticProps({ params }) {
  return getLangNicchiaProps('fr', params);
}

export default function NicchiaPage(props) {
  return <LangNicchia {...props} lang="fr" />;
}
