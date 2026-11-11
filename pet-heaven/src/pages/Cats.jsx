import PageHeader from '../components/PageHeader';
import PetListing from '../components/PetListing';

export default function Cats() {
  return (
    <>
      <PageHeader title="Cats for Adoption" intro="Curious kittens and gentle seniors are ready to purr their way into your heart." />
      <section className="section">
        <div className="container">
          <PetListing type="Cat" />
        </div>
      </section>
    </>
  );
}
