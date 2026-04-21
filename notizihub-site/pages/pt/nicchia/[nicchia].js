import LangNicchia from '../../../components/LangNicchia';
import { getLangNicchiaPaths, getLangNicchiaProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangNicchiaPaths('pt');
}

export async function getStaticProps({ params }) {
  return getLangNicchiaProps('pt', params);
}

export default function NicchiaPage(props) {
  return <LangNicchia {...props} lang="pt" />;
}
