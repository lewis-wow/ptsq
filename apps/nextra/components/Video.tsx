import dynamic from 'next/dynamic';

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
});

export type VideoProps = {
  src: string;
};

export const Video = ({ src }: VideoProps) => {
  return (
    <MediaQuery minWidth={640}>
      <div className="w-full aspect-video mt-6 first:mt-0">
        <video autoPlay muted loop>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </MediaQuery>
  );
};
