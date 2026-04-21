import LangNicchia from '../../../components/LangNicchia';
import { getLangNicchiaPaths, getLangNicchiaProps } from '../../../lib/langPageHelpers';

export async function getStaticPaths() {
  return getLangNicchiaPaths('en');
}

export async function getStaticProps({ params }) {
  return getLangNicchiaProps('en', params);
}

export default function NicchiaPage(props) {
  return <LangNicchia {...props} lang="en" />;
}
