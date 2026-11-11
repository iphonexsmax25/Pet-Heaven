import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import RequireEmployee from './components/RequireEmployee';
import CustomerOrPublicRoute from './components/CustomerOrPublicRoute';
import CustomerOnlyRoute from './components/CustomerOnlyRoute';
import Home from './pages/Home';
import Dogs from './pages/Dogs';
import Cats from './pages/Cats';
import AllPets from './pages/AllPets';
import AdoptedAnimals from './pages/AdoptedAnimals';
import PetDetails from './pages/PetDetails';
import About from './pages/About';
import Mission from './pages/Mission';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdoptPet from './pages/AdoptPet';
import ReleasePet from './pages/ReleasePet';
import AddPet from './pages/AddPet';
import PetCare from './pages/PetCare';
import PetMatching from './pages/PetMatching';
import PersonalityTest from './pages/PersonalityTest';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import Favourites from './pages/Favourites';
import Account from './pages/Account';
import AdoptionHistory from './pages/AdoptionHistory';
import MyReleasedPets from './pages/MyReleasedPets';
import MyAdoptedPets from './pages/MyAdoptedPets';
import AdminDashboard from './pages/AdminDashboard';
import AdminPets from './pages/AdminPets';
import AdminApplications from './pages/AdminApplications';
import AdminReleases from './pages/AdminReleases';
import AdminReports from './pages/AdminReports';
import AdminMessages from './pages/AdminMessages';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/pets" element={<AllPets />} />
          <Route path="/adopted-animals" element={<AdoptedAnimals />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/contact" element={<CustomerOrPublicRoute><Contact /></CustomerOrPublicRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/adopt" element={<CustomerOnlyRoute><AdoptPet /></CustomerOnlyRoute>} />
          <Route path="/release" element={<ProtectedRoute><ReleasePet /></ProtectedRoute>} />
          <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
          <Route path="/pet-care" element={<PetCare />} />
          <Route path="/pet-matching" element={<PetMatching />} />
          <Route path="/personality-test" element={<PersonalityTest />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/adoption-history" element={<ProtectedRoute><AdoptionHistory /></ProtectedRoute>} />
          <Route path="/my-released-pets" element={<ProtectedRoute><MyReleasedPets /></ProtectedRoute>} />
          <Route path="/my-adopted-pets" element={<ProtectedRoute><MyAdoptedPets /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<RequireEmployee><AdminDashboard /></RequireEmployee>} />
          <Route path="/admin/pets" element={<RequireEmployee><AdminPets /></RequireEmployee>} />
          <Route path="/admin/applications" element={<RequireEmployee><AdminApplications /></RequireEmployee>} />
          <Route path="/admin/releases" element={<RequireEmployee><AdminReleases /></RequireEmployee>} />
          <Route path="/admin/reports" element={<RequireEmployee><AdminReports /></RequireEmployee>} />
          <Route path="/admin/messages" element={<RequireEmployee><AdminMessages /></RequireEmployee>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
