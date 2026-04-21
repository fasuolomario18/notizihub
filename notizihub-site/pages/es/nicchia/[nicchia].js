import LangNicchia from '../../../components/LangNicchia';
import { getLangNicchiaPaths, getLangNicchiaProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangNicchiaPaths('es');
}

export async function getStaticProps({ params }) {
  return getLangNicchiaProps('es', params);
}

export default function NicchiaPage(props) {
  return <LangNicchia {...props} lang="es" />;
}
