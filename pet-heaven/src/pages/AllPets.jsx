import PageHeader from '../components/PageHeader';
import PetListing from '../components/PetListing';

export default function AllPets() {
  return (
    <>
      <PageHeader title="Available Pets" intro="Dogs, cats, rabbits, birds and more. Browse every pet waiting for a loving home." />
      <section className="section">
        <div className="container">
          <PetListing availableOnly />
        </div>
      </section>
    </>
  );
}
