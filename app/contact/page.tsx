import MovingCostCalculator from "@/components/MovingCostCalculator";

const ContactUs: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-8">
      <MovingCostCalculator />
      <h1 className="text-3xl font-bold text-teal-700 mb-4">Contact Us</h1>

      <div className="space-y-4 text-gray-700">
        <div>
          <p className="font-bold">Address:</p>
          <p>2719 Hollywood Blvd #1372</p>
          <p>Hollywood, FL 33020</p>
        </div>
        <div>
          <p className="font-bold">Call Us:</p>
          <a href="tel:+18882021370" className="text-blue-600 hover:underline">
            +1 888 202 1370
          </a>
        </div>
        <div>
          <p className="font-bold">Email:</p>
          <a
            href="mailto:info@movingquotetexas.com"
            className="text-blue-600 hover:underline"
          >
            info@movingquotetexas.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
