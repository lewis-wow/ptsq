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
      <div className="p-4 w-full aspect-video">
        <video autoPlay muted loop>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </MediaQuery>
  );
};
