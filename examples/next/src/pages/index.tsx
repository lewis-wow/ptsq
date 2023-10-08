export default function Home() {
  return (
    <main>
      <button
        onClick={async () => {
          const result = await fetch('http://localhost:4000/schema-rpc/introspection').then((res) => res.json());
          console.log(result);
        }}
      >
        Introspection
      </button>
    </main>
  );
}
