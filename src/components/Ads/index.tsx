import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";



export default function Ads() {
    if (ExecutionEnvironment.canUseDOM) {
        const UnionAds = require('union-ad-react');
        return <UnionAds id="u6954954" />;
    }
    
    return null;
}