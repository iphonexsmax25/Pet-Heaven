import PageHeader from '../components/PageHeader';
import PetListing from '../components/PetListing';

export default function Dogs() {
  return (
    <>
      <PageHeader title="Dogs for Adoption" intro="From playful puppies to calm seniors, find a loyal dog who is waiting for you." />
      <section className="section">
        <div className="container">
          <PetListing type="Dog" />
        </div>
      </section>
    </>
  );
}
