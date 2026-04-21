import LangHome from '../../components/LangHome';
import { getLangHomeProps } from '../../lib/langPageHelpers';

export async function getStaticProps() {
  return getLangHomeProps('en');
}

export default function Home(props) {
  return <LangHome {...props} lang="en" />;
}
