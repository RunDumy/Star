import dynamic from 'next/dynamic';

const TribeStream = dynamic(() => import('../src/components/cosmic/TribeStream'), {
    ssr: false,
});

const TribeStreamPage = () => <TribeStream />;
export default TribeStreamPage;