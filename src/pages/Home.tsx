import { Link } from "react-router-dom";

export const Home = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Welcome to Wine Aggregator</h1>
    <p>Your one-stop place for comparing wines across retailers with Vivino ratings.</p>
    <p className="mt-6">
      <Link to="/search" className="text-blue-600 hover:underline">
        Start Searching Wines →
      </Link>
    </p>
  </div>
);
