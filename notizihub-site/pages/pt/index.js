import LangHome from '../../components/LangHome';
import { getLangHomeProps } from '../../lib/langPageHelpers';

export async function getStaticProps() {
  return getLangHomeProps('pt');
}

export default function Home(props) {
  return <LangHome {...props} lang="pt" />;
}
