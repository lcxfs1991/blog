import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Ads from '../components/Ads';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          {/* <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link> */}
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className={styles.wrapper}>
          <img className={styles.avatar} src={require('../../static/img/avatar.jpeg').default} />
          <blockquote className={styles.blockquote}>
            李成熙(heyli)，现500强央企数字化技术负责人，前端架构师。2014年加入AlloyTeam，先后负责过QQ群、花样直播等业务；
            2019年加入腾讯云云开发团队；同年加入Shopee，担任金融商家业务前端负责人；
            2020年-2022年回归腾讯文档，单人文字品类技术负责人
            &nbsp;<a href="https://weibo.com/leehkfs/" target='_blank'>微博</a> | <a href="https://www.zhihu.com/people/leehey/" target='_blank'>知乎</a> | <a href="https://github.com/lcxfs1991" target='_blank'>Github</a>
          </blockquote>
          <Ads />
        </div> 
      </main>
    </Layout>
  );
}
