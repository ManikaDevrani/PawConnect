
import { useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const animals = [
  {
    name: "Bruno",
    type: "Dog",
    age: "2 years",
    gender: "Male",
    breed: "Golden Retriever",
    location: "Dehradun, Uttarakhand",
    status: "Needs a home",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
    color: "#f7e4d2",
    description: "A friendly boy looking for a loving family.",
  },
  {
    name: "Misty",
    type: "Cat",
    age: "1 year",
    gender: "Female",
    breed: "Domestic Shorthair",
    location: "Kotdwar, Uttarakhand",
    status: "For adoption",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800",
    color: "#e7e9d8",
    description: "A gentle little cat who loves attention.",
  },
  {
    name: "Rocky",
    type: "Dog",
    age: "3 years",
    gender: "Male",
    breed: "Labrador Mix",
    location: "Rishikesh, Uttarakhand",
    status: "Needs a rescue",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    color: "#f6e3e0",
    description: "Needs care, safety, and a second chance.",
  },
];
function App() {
  const [filter, setFilter] = useState("All");
  const [rescueReports, setRescueReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [apiStatus, setApiStatus] = useState("Not tested");
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [showAnimalDetails, setShowAnimalDetails] = useState(false);

  const filteredAnimals =
    filter === "All"
      ? animals
      : animals.filter((animal) => animal.type === filter);

  async function testBackend() {
    try {
      const response = await fetch("http://localhost:5001/api/health");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Backend connection failed.");
      }

      setApiStatus(data.message);
    } catch (error) {
      setApiStatus("Could not connect to backend");
    }
  }

  async function loadRescueReports() {
    setReportsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/rescue-reports"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load rescue reports.");
      }

      setRescueReports(data.reports);
    } catch (error) {
      console.error("Error loading reports:", error);
      alert(error.message || "Could not load rescue reports.");
    } finally {
      setReportsLoading(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const report = {
      reporter_name: formData.get("reporter_name"),
      contact: formData.get("contact"),
      animal_type: formData.get("animal_type"),
      location: formData.get("location"),
      description: formData.get("description"),
    };

    try {
      const response = await fetch(
        "http://localhost:5001/api/rescue-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(report),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit report.");
      }

      alert("Rescue report saved successfully! 🐾");
      setShowReportForm(false);

      // Refresh the list so the newly submitted report appears.
      await loadRescueReports();
    } catch (error) {
      console.error("Report submission error:", error);
      alert(error.message || "Could not connect to the server.");
    }
  }

  // Show the dashboard without replacing the homepage code.
  if (showAdminDashboard) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowAdminDashboard(false)}
          style={{
            margin: "16px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          ← Back to PawConnect
        </button>

        <AdminDashboard />
      </>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#home">
          <span className="logo-icon">🐾</span> PawConnect
        </a>

        <div className="nav-links">
          <a href="#animals">Find a friend</a>
          <a href="#how-it-works">How it works</a>
          <a className="nav-button" href="#report">
            Get help
          </a>

          <button
            type="button"
            className="nav-button"
            onClick={() => setShowAdminDashboard(true)}
          >
            Admin Dashboard
          </button>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              ❤️ Every paw deserves a chance
            </span>

            <h1>
              Small acts of kindness.
              <br />
              <span>Life-changing</span> love.
            </h1>

            <p>
              Helping animals find safety, care, and a forever home.
              Connect with people who believe every life matters.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#animals">
                Meet the animals <span>→</span>
              </a>

              <a className="secondary-button" href="#report">
                Report an animal
              </a>
            </div>

            <div className="hero-note">
              <span>🐾</span> Rescue. Care. Adopt. Repeat.
            </div>
          </div>

          <div className="hero-art">
  <div className="art-circle">
    <img
      src="https://images.unsplash.com/photo-1551717743-49959800b1f6?w=900"
      alt="Happy dog waiting for a loving home"
      className="hero-animal-photo"
    />
  </div>

  <div className="floating-card">
    <span className="heart">♥</span>
    <div>
      <strong>A second chance</strong>
      <small>Can change everything.</small>
    </div>
  </div>
</div>
        </section>

        <section className="impact">
          <div>
            <strong>01</strong>
            <span>Report animals in need</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Connect with rescuers</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Find loving homes</span>
          </div>
        </section>

        <section className="animals-section" id="animals">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                MEET YOUR NEW BEST FRIEND
              </span>
              <h2>Faces waiting for love</h2>
              <p>
                Every animal has a story. You could be their happy ending.
              </p>
            </div>

            <div className="filters">
              {["All", "Dog", "Cat"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={filter === type ? "filter active" : "filter"}
                  onClick={() => setFilter(type)}
                >
                  {type === "All" ? "All friends" : `${type}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="animal-grid">
            {filteredAnimals.map((animal) => (
              <article className="animal-card" key={animal.name}>
                <div className="animal-picture">
                <img
                 src={animal.image}
                alt={animal.name}
                 className="animal-photo"
                />
                 <span className="status">{animal.status}</span>
                </div>
                <div className="animal-info">
                  <div className="animal-title">
                    <h3>{animal.name}</h3>
                    <span>{animal.type}</span>
                  </div>

                  <p className="location">📍 {animal.location}</p>
                  <p className="description">{animal.description}</p>

                  <button
                   type="button"
                   className="details-button"
                   onClick={() => {
                   setSelectedAnimal(animal);
                   setShowAnimalDetails(true);
                   }}
                   >
                   View Details
                  </button>

                  <button
                   type="button"
                   className="card-button"
                   onClick={() => {
                   setSelectedAnimal(animal);
                   setShowAdoptionForm(true);
                   }}
                  >
                   Adopt {animal.name} <span>↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="steps-section" id="how-it-works">
          <span className="eyebrow">KINDNESS STARTS HERE</span>
          <h2>Three steps. One big difference.</h2>

          <div className="steps-grid">
            <div className="step">
              <span className="step-icon">📸</span>
              <h3>Spot &amp; report</h3>
              <p>Share details about an animal that needs help.</p>
            </div>

            <div className="step">
              <span className="step-icon">🤝</span>
              <h3>Connect &amp; care</h3>
              <p>Help rescuers and volunteers coordinate care.</p>
            </div>

            <div className="step">
              <span className="step-icon">🏡</span>
              <h3>Love &amp; adopt</h3>
              <p>Give an animal a safe place to call home.</p>
            </div>
          </div>
        </section>

        <section className="report-banner" id="report">
          <div>
            <span className="eyebrow">BE THEIR VOICE</span>
            <h2>Seen an animal in need?</h2>
            <p>
              Your small action could make a world of difference.
            </p>
          </div>

          <button
            type="button"
            className="report-button"
            onClick={() => setShowReportForm(!showReportForm)}
          >
            {showReportForm ? "Close form ×" : "Report an animal →"}
          </button>
        </section>

        {showReportForm && (
          <section className="report-form">
            <h2>Report an animal in need</h2>
            <p>
              Share a few details so a rescue team can understand the
              situation.
            </p>

            <form onSubmit={submitReport}>
              <label>
                Your name
                <input
                  type="text"
                  name="reporter_name"
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Contact number
                <input
                  type="tel"
                  name="contact"
                  placeholder="Enter your contact number"
                  required
                />
              </label>

              <label>
                Animal type
                <select name="animal_type" required defaultValue="">
                  <option value="" disabled>
                    Select animal
                  </option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Dehradun, Uttarakhand"
                  required
                />
              </label>

              <label>
                Describe the situation
                <textarea
                  name="description"
                  placeholder="Tell us what happened and what help is needed..."
                  required
                  rows="4"
                />
              </label>

              <button className="report-button" type="submit">
                Submit report
              </button>
            </form>
          </section>
        )}
{showAnimalDetails && selectedAnimal && (
<section
  className="report-form animal-details"
  id="animal-details"
  ref={(element) => {
    if (element && showAnimalDetails) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }}
>
    <h2>Meet {selectedAnimal.name} 🐾</h2>

    <img
      src={selectedAnimal.image}
      alt={selectedAnimal.name}
      className="details-photo"
    />

    <p>{selectedAnimal.description}</p>

    <div className="details-info">
      <p><strong>Animal:</strong> {selectedAnimal.type}</p>
      <p><strong>Breed:</strong> {selectedAnimal.breed}</p>
      <p><strong>Age:</strong> {selectedAnimal.age}</p>
      <p><strong>Gender:</strong> {selectedAnimal.gender}</p>
      <p><strong>Location:</strong> {selectedAnimal.location}</p>
      <p><strong>Status:</strong> {selectedAnimal.status}</p>
    </div>

    <button
      type="button"
      className="report-button"
      onClick={() => {
        setShowAnimalDetails(false);
        setShowAdoptionForm(true);
      }}
    >
      Adopt {selectedAnimal.name}
    </button>

    <button
      type="button"
      className="card-button"
      onClick={() => {
        setShowAnimalDetails(false);
        setSelectedAnimal(null);
      }}
    >
      Close
    </button>
  </section>
)}

{showAdoptionForm && selectedAnimal && (
  <section className="report-form" id="adoption-form">
    <h2>Adoption enquiry for {selectedAnimal.name} 🐾</h2>
    <p>Tell us a little about yourself and why you'd like to adopt.</p>

    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const application = {
          animal_name: selectedAnimal.name,
          applicant_name: formData.get("applicant_name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          reason: formData.get("reason"),
        };

        try {
          const response = await fetch(
            "http://localhost:5001/api/adoption-applications",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(application),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Submission failed.");
          }

          alert("Adoption enquiry submitted successfully! 🐾");
          setShowAdoptionForm(false);
          setSelectedAnimal(null);
        } catch (error) {
          alert(error.message || "Could not submit your enquiry.");
        }
      }}
    >
      <label>
        Your name
        <input name="applicant_name" type="text" required />
      </label>

      <label>
        Email address
        <input name="email" type="email" required />
      </label>

      <label>
        Contact number
        <input name="phone" type="tel" required />
      </label>

      <label>
        Why would you like to adopt {selectedAnimal.name}?
        <textarea name="reason" rows="4" required />
      </label>

      <button type="submit" className="report-button">
        Submit adoption enquiry
      </button>

      <button
        type="button"
        className="card-button"
        onClick={() => {
          setShowAdoptionForm(false);
          setSelectedAnimal(null);
        }}
      >
        Cancel
      </button>
    </form>
  </section>
)}

      </main>

      <section className="rescue-reports-section">
        <h2>Rescue Reports</h2>
        <p>See animals reported as needing help.</p>

        <button
          type="button"
          className="report-button"
          onClick={loadRescueReports}
          disabled={reportsLoading}
        >
          {reportsLoading ? "Loading reports..." : "Load Rescue Reports"}
        </button>

        {reportsLoading && <p>Loading reports...</p>}

        {!reportsLoading && rescueReports.length === 0 && (
          <p>Click the button to view submitted reports.</p>
        )}

        <div className="animal-grid">
          {rescueReports.map((report) => (
            <article className="animal-card" key={report.id}>
              <div className="animal-info">
                <h3>{report.animal_type} needing help</h3>
                <p>
                  <strong>Location:</strong> {report.location}
                </p>
                <p>
                  <strong>Situation:</strong> {report.description}
                </p>
                <p>
                  <strong>Status:</strong> {report.status}
                </p>
                <p>
                  <strong>Reported:</strong>{" "}
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <a className="logo" href="#home">
          🐾 PawConnect
        </a>
        <p>Made with love for the ones who need it most. ♥</p>
        <span>Rescue • Care • Adopt</span>
      </footer>

      {/* Temporary backend connection test */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <button
          type="button"
          onClick={testBackend}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Test Backend Connection
        </button>

        <p>Backend status: {apiStatus}</p>
      </div>
    </div>
  );
}

export default App;
