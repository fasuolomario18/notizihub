import LangNicchia from '../../../components/LangNicchia';
import { getLangNicchiaPaths, getLangNicchiaProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangNicchiaPaths('de');
}

export async function getStaticProps({ params }) {
  return getLangNicchiaProps('de', params);
}

export default function NicchiaPage(props) {
  return <LangNicchia {...props} lang="de" />;
}
