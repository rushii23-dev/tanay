import { Page, PageBanner } from '../components/Page';
import StateRows from '../components/StateRows';

export default function StatesIndex() {
  return (
    <Page>
      <PageBanner photo="greenField" crumb="States" title="Eight states, eight ways of farming.">
        From the irrigated wheat fields of Punjab to the north-east-monsoon rice of Tamil Nadu, each state has its own climate, soil and
        crops. Choose one to see its full profile.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <StateRows detailed />
          <p className="note" data-reveal>
            Monsoon share is the part of a year’s rain that falls in June–September. Yields are the latest official figures (2022-23 third
            advance estimates where published). A dash means the crop is not grown at a reportable scale.
          </p>
        </div>
      </div>
    </Page>
  );
}
