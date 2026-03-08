import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingSection from "@/components/BookingSection";

const BookingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <BookingSection />
      </div>
      <Footer />
    </div>
  );
};

export default BookingsPage;
